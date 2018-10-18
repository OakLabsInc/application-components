import grpc
import sys
import filesync_pb2
import filesync_pb2_grpc

EMPTY = filesync_pb2.Empty()


def main():
    target = sys.argv[1]
    channel = grpc.insecure_channel(target)
    stub = filesync_pb2_grpc.FilesyncStub(channel)
    print(stub.Info(EMPTY))


if __name__ == '__main__':
    main()
