FROM python:3.8-buster

MAINTAINER Stefano Dalla Palma

RUN python3.8 -m pip install --upgrade pip

COPY . /app

WORKDIR /app

# Clone the ansible metrics repository
RUN pip install -r requirements.txt

CMD ["python3.8", "app.py"]
