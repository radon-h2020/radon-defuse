# api/models/pre-trained-model

Get a pre-trained mode from the most similar project.

**URL**

```/api/models/pre-trained-model```


**METHOD**

```POST```

**BODY**

```application/json```

A json consisting of scores for the following attributes:

```json
{
    "commitFrequency": <number>,
    "coreContributors": <integer>,
    "issueFrequency": <number>,
    "percentComments": <number>,
    "percentIac": <number>,
    "sloc": <integer>,
    "releases": <integer>,
    "percentDefects": <number>,
    "commits": <integer>
}
```

**RESPONSE**

**Success response**

A success response returns a JSON file consisting of the following fields:

* ```attribute: List<strings>``` - list the attributes selected by the pre-trained model during training;

* ```model: <object>``` - contain serialized serialized pipeline, encoded with the library ```jsonpickle==1.4.1```. To decode it, import it in your code and call ```jsonpickle.decode(response['model'])```.

An example of response follows.

Code: 200

Content: 
```json
{
  "attributes": [
    "avg_task_size",
    "code_churn",
    ...
    "lines_code",
    "num_commands",
  ],
  "model": "{\"py/object\": \"imblearn.pipeline.Pipeline\", \"py/state\": {\"steps\": [{\"py/tuple\": [\"var\", {\"py/object\": \"sklearn.feature_selection._variance_threshold.VarianceThreshold\", \"py/state\": {\"threshold\": 0, \"variances_\": {\"py/reduce\": [{\"py/function\": \"numpy.core.multiarray._reconstruct\"}, {\"py/tuple\": [{\"py/type\": \"numpy.memmap\"}, {\"py/tuple\": [0]}, {\"py/b64\": \"Yg==\"}]}, {\"py/tuple\": [1, {\"py/tuple\": [108]}, {\"py/reduce\": [{\"py/type\": \"numpy.dtype\"}, {\"py/tuple\": [\"f8\", 0, 1]}, {\"py/tuple\": [3, \"<\", null, null, null, -1, -1, 0]}]}, false, {\"py/b64\": \"AAAAAA...yaS3nd23AAA=\"}]}]}}]}, \"_sklearn_version\": \"0.22.1\"}}]}], \"memory\": null, \"verbose\": false}}"
}
```

**Error response**


****