# radon-defect-prediction-tool
A defect prediction for IaC

## How to run

From the project location, build the docker image with

```
docker build -t radon-dp:latest .
```

then run it with

```
docker run -p 5000:5000 radon-dp:latest
```

The server is now started.

## Endpoints

- http://localhost:5000/api/classification/classify
- http://localhost:5000/api/metrics/all
