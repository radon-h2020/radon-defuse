APIs and examples of usages for the RADON Framework for IaC Defect Prediction.

# Repositories 

## ```/repositories/```
Render a list of all the repositories.

## ```/repositories/add/``` (TODO)
Add a new repositories to the collection.
This API is useful to upload private repositories.

## ```/repositories/labels/```  (TODO)
Collect bug-related issue labels from the collection of repositories. 

## ```/repositories/dump/```
Dump the *repositories* collection in JSON format.


## ```/repositories/{id}/```
Render a repository details.


## ```/repositories/{id}/dump/```
Dump the repository in JSON format.


## ```/repositories/{id}/fixing-commits/```
Retrieve the fixing-commits in a repository.


## ```/repositories/{id}/fixing-commits/{sha}/delete/```
Delete the fixing-commit with that ```sha```.


## ```/repositories/{id}/fixing-files/```
Render the repositories fixing-files.


## ```/repositories/{id}/labeled-files/```
Render the repositories labeled-files.


## ```/repositories/{id}/mine/```
Mine the repository.
It fetches:
 
* fixing-commits
* fixing-files
* labeled-files

and extracts process metrics from every releases and product metrics from every files.

| Parameter           | Value | Required | Description                                                                                                                                                                                                                       |
|---------------------|-------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| path_to_clones      | str   | True     | Path to the repository on the local machine or where to clone it in case it does not exists                                                                                                                                       |
| github_access_token | str   | True     | A token to access Github APIs to fetch the repository information. See how to create a [personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)  |
| lables              | str   | False    | A list of tags, separated by commas, to identify bug-related issues. <br/>**Default:** ```bug, type: bug ...```                                                                                                                             |
| regex               | str   | False    | A regular expression to identify fixing-commits. **Default: ** ```(bug\|patch\|...)```                                                                                                                                           |


## ```/repositories/{id}/score/```
Computes the value for the following N dimensions indicating well-engineered projects:

* IaC ration
* sloc
* ...

and extracts process metrics from every releases and product metrics from every files.

| Parameter           | Value | Required | Description                                                                                                                                                                                                                       |
|---------------------|-------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| path_to_clones      | str   | True     | Path to the repository on the local machine or where to clone it in case it does not exists                                                                                                                                       |
| github_access_token | str   | True     | A token to access Github APIs to fetch the repository information. See how to create a [personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)  |



## ```/repositories/{id}/train/``` (TODO)
Train a machine-learning classifier to predict the defectiveness of IaC scripts

