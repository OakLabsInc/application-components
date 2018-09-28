import server
import grpc
import pytest
import time

import oak_lights_pb2
import oak_lights_pb2_grpc

EMPTY = oak_lights_pb2.Empty()


@pytest.fixture(scope='session')
def stub():
    s = server.make_server('0.0.0.0:10000')
    s.start()
    channel = grpc.insecure_channel('localhost:10000')
    yield oak_lights_pb2_grpc.OakLightsStub(channel)
    s.stop(0)


def test_info(stub):
    i = stub.Info(EMPTY)
    assert len(i.controllers)


def test_change(stub):
    i = stub.Info(EMPTY)

    for l in i.controllers:
        cid = l.controller_id
        for color in ('#F00 #0F0 #00F'.split()):
            assert stub.ChangeColor(oak_lights_pb2.ChangeColorRequest(
                controller_id=cid,
                hex=color,
                white=20,
                duration=500
            )) == EMPTY
            time.sleep(0.5)


def test_zeros(stub):
    i = stub.Info(EMPTY)
    for l in i.controllers:
        assert stub.ChangeColor(oak_lights_pb2.ChangeColorRequest(
            controller_id=l.controller_id,
            hex='#000',
            white=0,
            duration=200,
        )) == EMPTY
