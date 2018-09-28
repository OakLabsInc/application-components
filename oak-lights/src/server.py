import concurrent.futures
import grpc
import os
import serial
import time
import webcolors

import oak_lights_pb2
import oak_lights_pb2_grpc

PORT = os.getenv('PORT')
DEVICE_DIR = '/dev/oak/oak-lights/'


def main():
    address = '0.0.0.0:%s' % PORT
    server = make_server(address)
    server.start()
    print('oak-lights component serving on %s' % address)

    try:
        while True:
            time.sleep(60 * 60 * 24)
    except KeyboardInterrupt:
        server.stop(0)


def make_server(address):
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    oak_lights_pb2_grpc.add_OakLightsServicer_to_server(
        OakLightsServicer(), server)
    server.add_insecure_port(address)
    return server


class OakLightsServicer(oak_lights_pb2_grpc.OakLightsServicer):

    def Info(self, request, context):
        controller_ids = safe_list_dir(DEVICE_DIR)
        controllers = [{'controller_id': id_} for id_ in controller_ids]
        return oak_lights_pb2.OakLightsInformation(controllers=controllers)

    def ChangeColor(self, request, context):
        device = OakLights(os.path.join(DEVICE_DIR, request.controller_id))
        if request.WhichOneof('color') == 'rgb':
            r, g, b = request.rgb.r, request.rgb.g, request.rgb.b
        else:
            r, g, b = webcolors.hex_to_rgb(request.hex)
        device.write(r, g, b, request.white, request.duration)
        # TODO block until complete?
        return oak_lights_pb2.Empty()


class OakLights(object):

    def __init__(self, path):
        self.path = path
        self.device_id = path.rsplit('/')[-1]
        self.device = serial.Serial(port=path, baudrate=115200)

    def write(self, r, g, b, w, d):
        if not all(0 <= x < 256 for x in (r, g, b, w)) or d < 0:
            raise Exception('Invalid parameters for Oak Light device')
        cmd = b'%d,%d,%d,%d,%d\n' % (r, g, b, w, d)
        try:
            self.device.write(cmd)
        except serial.SerialTimeoutException:
            raise Exception('Timed out sending command to device')


def safe_list_dir(path):
    return os.listdir(path) if os.path.isdir(path) else []


if __name__ == '__main__':
    main()
