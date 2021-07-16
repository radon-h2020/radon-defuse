import json
import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.metrics import make_scorer, matthews_corrcoef
from sklearn.model_selection import RandomizedSearchCV
from sklearn.preprocessing import MinMaxScaler
from sklearn.tree import DecisionTreeClassifier

from sklearn.utils import indexable
from sklearn.utils.validation import _num_samples


def walk_forward_release(X, y, releases):
    """
    Generate train and test splits fro TimeSeriesSplit on releases.
    Train consists of a release or a list of successive releases, and
    the test set consist of the next release in time
    :param X: array-like of shape (n_samples, m_features)
    :param y: array-like of shape (n_samples,)
    :param releases : array-like of shape (n_samples,)
        Group labels for the samples used while splitting the dataset into
        train/test set.
        Must be a list of integer, i.e., [1, 1, 1, 2, 2, 3, 4, 4, etc.].
        Each integer denotes a release. Files within the same release have the same group id.
    """
    X, _, releases = indexable(X, y, releases)
    n_samples = _num_samples(X)
    n_folds = len(set(releases))  # Number of distinct groups (releases)

    if n_folds > n_samples:
        raise ValueError(f"Cannot have number of folds ={n_folds} greater than the number of samples: {n_samples}.")

    indices = np.arange(n_samples)
    offset = 0

    for _ in range(0, n_folds - 1):
        train_indices = [i for i, x in enumerate(releases) if x == releases[offset]]
        offset += len(train_indices)
        test_indices = [i for i, x in enumerate(releases) if x == releases[offset]]

        yield indices[:offset], indices[offset: offset + len(test_indices)]


scoring = dict(
    roc_auc='roc_auc',
    average_precision='average_precision',
    precision='precision',
    recall='recall',
    mcc=make_scorer(matthews_corrcoef)
)

pipe = Pipeline([
    ('normalization', MinMaxScaler()),
    ('feature_selection', SelectKBest(chi2, k=2)),
    ('classification', DecisionTreeClassifier())
])

search_params = dict(
    classification__criterion=['gini', 'entropy'],
    classification__splitter=['best', 'random'],
    classification__max_features=['auto', 'sqrt', 'log2', None],
    classification__class_weight=['balanced', None]
)


class DefectPredictor:

    def __init__(self):
        self.model = None

    def load(self, estimator: Pipeline, features: list):
        self.model = {
            'estimator': estimator,
            'features': features
        }

    def train(self, data: pd.DataFrame):

        X, y = self.prepare_training_data(data)
        releases = X.group.astype(int).tolist()
        X.drop(['group'], axis=1, inplace=True)

        search_params['feature_selection__k'] = np.linspace(start=1, stop=X.shape[1], num=10, dtype=int)
        search = RandomizedSearchCV(pipe, search_params, cv=walk_forward_release(X, y, releases), scoring=scoring,
                                    refit='average_precision', verbose=10)

        try:
            search.fit(X, y)
            cv_report = pd.DataFrame(search.cv_results_).iloc[[search.best_index_]]  # Take best estimator's scores
            cv_parsed = json.loads(cv_report.to_json(orient='records'))[0]

            selected_features_indices = search.best_estimator_.named_steps['feature_selection'].fit(X, y).get_support(indices=True)
            selected_features = X.iloc[:, selected_features_indices].columns.tolist()

            # Update normalizer
            new_normalizer = search.best_estimator_.named_steps['normalization'].fit_transform(X[selected_features])
            search.best_estimator_.named_steps['normalization'] = new_normalizer

            self.model = {
                'estimator': search.best_estimator_,
                'report': cv_parsed,
                'features': selected_features
            }

        except Exception as e:
            print(e)

    def predict(self, unseen_data: pd.DataFrame) -> dict:
        """
        Predict an unseen instance as failure-prone or clean.
        :param unseen_data: pandas DataFrame containing the observation to predict
        :return: A dictionary with the prediction value and an explanation, if any
        """
        if not self.model['estimator'] and not self.model['features']:
            raise Exception('No model loaded yet. Please, load a model using instance.load(estimator, features)')

        # Set missing features in unseen_data to zero
        for feature_name in self.model['features']:
            if feature_name not in unseen_data:
                unseen_data[feature_name] = 0

        # Select same model features
        unseen_data = unseen_data[np.intersect1d(unseen_data.columns, self.model['features'])]

        column_names = unseen_data.columns.to_list()

        # Pre-process
        unseen_data_local = pd.DataFrame(self.model['estimator'].named_steps['normalization'].transform(unseen_data))

        tree_clf = self.model['estimator'].named_steps['classification']
        failure_prone = bool(tree_clf.predict(unseen_data_local)[0])

        prediction = {
            'failure_prone': failure_prone,
            'explanation': []
        }

        if not failure_prone:
            decision = []
            decision_path = tree_clf.decision_path(unseen_data_local)
            level_length = len(decision_path.indices)
            i = 1
            for node_id in decision_path.indices:
                # Ignore last level because it is the last node without decision criteria or rule
                if i < level_length:
                    col_idx = tree_clf.tree_.feature[node_id]
                    col_name = column_names[col_idx]
                    threshold_value = round(tree_clf.tree_.threshold[node_id], 2)
                    original_value = unseen_data[col_name].loc[0]
                    normalized_value = unseen_data_local[col_idx].loc[0]

                    # Inverse normalize threshold to make it more comprehensible to the final user
                    threshold_value *= original_value / normalized_value
                    threshold_value = int(threshold_value)

                    decision.append((col_name, '<=' if original_value <= threshold_value else '>', threshold_value))

                i += 1

            prediction['decision'] = decision

        return prediction

    @staticmethod
    def prepare_training_data(data):
        assert 'failure_prone' in data.columns
        assert 'commit' in data.columns
        assert 'committed_at' in data.columns
        assert 'filepath' in data.columns

        data = data.fillna(0)

        # Create column to group files belonging to the same release (identified by the commit hash)
        data['group'] = data.commit.astype('category').cat.rename_categories(range(1, data.commit.nunique() + 1))

        # Make sure the data is sorted by commit time (ascending)
        data.sort_values(by=['committed_at'], ascending=True)
        data = data.reset_index(drop=True)

        # Remove metadata
        data.drop(['commit', 'committed_at', 'filepath'], axis=1, inplace=True)
        X, y = data.drop(['failure_prone'], axis=1), data.failure_prone.values.ravel()
        return X, y