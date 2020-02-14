FROM python:3.6-alpine

MAINTAINER Stefano Dalla Palma

RUN apk add git

RUN python3.6 -m pip install --upgrade pip

COPY . /app

WORKDIR /app

# Clone the ansible metrics repository
# Use RUN pip3 install ansible-metrics when on pip repositoris
RUN git clone https://github.com/radon-h2020/radon-ansible-metrics.git /app/radon-ansible-metrics

RUN ls /app/

# This line could be deleted once ansiblemetrics will be on pip repos
ENV PYTHONPATH=/app/radon-ansible-metrics/        

RUN pip install -r requirements.txt \
    && cd radon-ansible-metrics \
    && pip install -r requirements.txt . \
    && pip install .

CMD ["python3.6", "app.py"]
