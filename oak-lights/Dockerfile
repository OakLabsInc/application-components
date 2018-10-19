FROM oaklabs/grpcio-tools:python3.7.0-1.15.0

COPY *.proto /protos/

RUN python -m grpc_tools.protoc --proto_path=/protos/ --python_out=/protos/ --grpc_python_out=/protos/ /protos/*.proto


FROM python:3.7.0-alpine

WORKDIR /src/

COPY src/requirements.txt ./
RUN apk --no-cache add --virtual .build-deps python-dev build-base \
    && pip install -r requirements.txt \
    && apk del .build-deps

COPY src/ ./

COPY --from=0 /protos/ /protos/

ENV PYTHONUNBUFFERED=yes \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/protos/

CMD python server.py
