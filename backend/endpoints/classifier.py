import json
import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
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
    ('classification', DecisionTreeClassifier())
])

search_params = dict(
    classification__criterion=['gini', 'entropy'],
    classification__splitter=['best', 'random'],
    classification__max_features=['auto', 'sqrt', 'log2', None],
    classification__class_weight=['balanced', None]
)


class DefectPredictor:

    def __init__(self, data: pd.DataFrame):
        self.prepare_training_data(data)
        self.model = None

    def prepare_training_data(self, data):
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
        self.X, self.y = data.drop(['failure_prone'], axis=1), data.failure_prone.values.ravel()

    def train(self):
        releases = self.X.group.astype(int).tolist()
        self.X = self.X.drop(['group'], axis=1)

        search = RandomizedSearchCV(pipe, search_params, cv=walk_forward_release(self.X, self.y, releases),
                                    scoring=scoring, refit='average_precision', verbose=10)

        try:
            search.fit(self.X, self.y)
            cv_report = pd.DataFrame(search.cv_results_).iloc[[search.best_index_]]  # Take best estimator's scores
            cv_parsed = json.loads(cv_report.to_json(orient='records'))[0]

            self.model = {
                'estimator': search.best_estimator_,
                'report': cv_parsed
            }

        except Exception as e:
            print(e)
