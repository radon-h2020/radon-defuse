FROM python:3.6-alpine

MAINTAINER Stefano Dalla Palma

RUN python3.6 -m pip install --upgrade pip

COPY . /app

WORKDIR /app

# Clone the ansible metrics repository
# Use RUN pip3 install ansible-metrics when on pip repositoris
RUN git clone https://github.com/radon-h2020/radon-ansible-metrics.git /ansible-metrics

# This line could be deleted once ansiblemetrics will be on pip repos
ENV PYTHONPATH=/app/ansible-metrics/        

RUN pip3 install -r requirements.txt \
    && cd ansible-metrics \
    && pip3 install -r requirements.txt . \
    && pip3 install .

CMD ["python3.6", "app.py"]
