FROM python:alpine3.7
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
ENV TMP_REPOSITORIES_DIR=/tmp/
ENTRYPOINT [ "python" ]
CMD [ "app.py" ]