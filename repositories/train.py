import numpy as np
import pandas as pd
import jsonpickle

from sklearn import tree
from sklearn import feature_selection
from sklearn import metrics
from sklearn import model_selection
from sklearn import preprocessing

from sklearn.utils import indexable
from sklearn.utils.validation import _num_samples

from imblearn.pipeline import Pipeline
from imblearn.under_sampling import RandomUnderSampler
from imblearn.over_sampling import RandomOverSampler

decision_tree_params = dict(
    clf__criterion=['gini', 'entropy'],
    clf__splitter=['best', 'random'],
    clf__max_features=['auto', 'sqrt', 'log2', None],
    clf__class_weight=['balanced', None]
)


def release_split(X, y, groups):
    """
    Generate train and test splits fro TimeSeriesSplit on releases.
    Train consists of a release or a list of successive releases, and
    the test set consist of the next release in time

    groups : array-like of shape (n_samples,)
        Group labels for the samples used while splitting the dataset into
        train/test set.
        Must be an ordered list of integer, i.e., [1, 1, 1, 2, 2, 3, 4, 4, etc.].
        Each integer denote a given release. Files within the same release have the same
        group id.
    """

    X, y, groups = indexable(X, y, groups)
    n_samples = _num_samples(X)
    n_folds = len(set(groups))  # Number of distinct groups (releases)
    if n_folds > n_samples:
        raise ValueError(
            ("Cannot have number of folds ={0} greater than the number of samples: {1}.").format(n_folds,
                                                                                                 n_samples))

    indices = np.arange(n_samples)
    offset = 0

    for _ in range(0, n_folds - 1):
        train_indices = [i for i, x in enumerate(groups) if x == groups[offset]]
        offset += len(train_indices)
        test_indices = [i for i, x in enumerate(groups) if x == groups[offset]]

        yield (indices[:offset], indices[offset: offset + len(test_indices)])


def pr_auc_score(y_true, y_pred):
    precision, recall, _ = metrics.precision_recall_curve(y_true, y_pred)
    return metrics.auc(recall, precision)


class ModelsManager:

    def __init__(self, df: pd.DataFrame):
        self.df = df.fillna(0)

        # Create column to group files belonging to the same release (identified by the commit hash)

        # self.groups = self.df.commit.astype('category').cat.rename_categories(range(1, self.df.release.nunique() + 1)).tolist()

        # Make sure the data is sorted by commit time (ascending)
        self.df.sort_values(by=['date'], ascending=True)
        self.df = self.df.reset_index(drop=True)
        self.df = self.df.drop(['release', 'date', 'filepath'], axis=1)

    def train(self):
        X, y = self.df.drop(['label'], axis=1), self.df.label.values.ravel()

        scoring = dict(
            roc_auc='roc_auc',
            pr_auc=metrics.make_scorer(pr_auc_score),
            accuracy='accuracy',
            balanced_accuracy='balanced_accuracy',
            precision='precision',
            recall='recall',
            f1='f1',
            mcc=metrics.make_scorer(metrics.matthews_corrcoef)
        )

        pipe = Pipeline([
            ('var', feature_selection.VarianceThreshold(threshold=0)),  # To remove constant features
            ('bal', None),  # To balance the training data See search_params['bal'] below)
            ('pre', None),  # To scale (and center) data. See search_params['pre'] below
            ('clf', tree.DecisionTreeClassifier())
        ])

        #groups = X.group.tolist()
        #X = X.drop(['group'], axis=1)

        decision_tree_params['bal'] = [None, RandomUnderSampler(sampling_strategy='majority', random_state=42),
                                       RandomOverSampler(sampling_strategy='minority', random_state=42)]

        decision_tree_params['pre'] = [None, preprocessing.MinMaxScaler(), preprocessing.StandardScaler()]

        search = model_selection.RandomizedSearchCV(pipe, decision_tree_params, cv=5,
                                                    scoring=scoring, refit='pr_auc', verbose=0)
        search.fit(X, y)

        cv_results = pd.DataFrame(search.cv_results_).iloc[
            [search.best_index_]]  # Take only the scores at the best index


        cv_results['n_features'] = X.shape[1]
        cv_results['y_0'] = y.tolist().count(0)
        cv_results['y_1'] = y.tolist().count(1)

        pkl_model = jsonpickle.encode(pipe)

        return cv_results.to_json(orient='table', index=False), pkl_model