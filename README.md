# radon-defect-prediction-tool
A defect prediction for IaC

## How to build and run

From the project location, build the docker image with

```
docker build -t radon-dp:latest .
```

then run it with

```
docker run -p 5000:5000 radon-dp:latest
```

The server is now started and ready to receive calls.

## Endpoints

Endpoint: http://localhost:5000/api/classification/**classify** 
Type: POST
Body: plain text representing an Ansible file
Return: boolean - True if file is defect-prone, False otherwise


Endpoint: http://localhost:5000/api/metrics/**all**
Type: GET
Body: None
Return: list[str] - List of implemented metrics (for description only)

Type: POST
Body: plain text representing an Ansible file
Return: dict(metric: value) - A dictionary of values of product metrics extracted from the file