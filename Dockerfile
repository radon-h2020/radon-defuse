FROM python:3.6-alpine

MAINTAINER Stefano Dalla Palma

RUN apk add git

RUN python3.6 -m pip install --upgrade pip

COPY . /app

WORKDIR /app

# Clone the ansible metrics repository
RUN pip install ansiblemetrics==0.1
RUN pip install -r requirements.txt

CMD ["python3.6", "app.py"]
