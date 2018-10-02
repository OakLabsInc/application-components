# import logging
import os
import yaml

from flask import Flask
from flask import jsonify
from flask import Response
from flask_swagger import swagger

from filesync.manager import Filesync

GS_URL = os.getenv('GS_URL')
FILES_DIR = os.getenv('SYNC_DIR')
SYNC_INTERVAL = os.getenv('INTERVAL')

app = Flask(__name__)

# def setup_logging(app_):
#     app_.config['LOGGER_NAME'] = 'filesync'
#     log_handler = logging.StreamHandler()
#     log_handler.setFormatter(
#         logging.Formatter("%(asctime)-15s %(levelname)-5s %(message)s"))
#     app_.logger.addHandler(log_handler)
#     app_.logger.setLevel(logging.INFO)

# setup_logging(app)

with open('filesync/swagger.yaml') as f:
    SWAGGER_TEMPLATE = yaml.load(f.read())

FS = Filesync(GS_URL, FILES_DIR, SYNC_INTERVAL)
FS.begin()


@app.route("/")
def spec():
    return jsonify(swagger(app, template=SWAGGER_TEMPLATE))


@app.route('/state')
def state():
    """
    Collect info about current state of synchronization
    ---
    tags:
    - get
    operationId: state
    responses:
      200:
        description: object with self-explanatory information
    """

    return jsonify(FS.get_state())


@app.route('/restart', methods=["POST"])
def restart():
    """
    Start syncing or restart a sync in progress

    Use this if you've just updated a file and want it synced
    immediately.
    ---
    tags:
    - post
    operationId: restart
    responses:
      200:
        description: "'restarted'"

    """

    FS.abort_timer()
    FS.abort_process()
    FS.start_process()
    return 'restarted'


@app.route('/start', methods=["POST"])
def start():
    """
    Force the next sync to start now

    This will do nothing if a sync is in progress. If you want to see
    new files immediately, see `restart`. Use this endpoint if you're
    just impatient.
    ---
    tags:
    - post
    operationId: start
    responses:
      200:
        description: "'started' or 'already started'"
    """

    if FS.proc is None:
        FS.abort_timer()
        FS.start_process()
        return 'started'
    else:
        return 'already started'


@app.route('/abort', methods=["POST"])
def abort():
    """
    Cancel a sync in progress

    This will only cancel syncing if syncing is in progress at the
    time. This will not unschedule future syncs.
    ---
    tags:
    - post
    operationId: abort
    responses:
      200:
        description: "'aborted' or 'was not syncing'"
    """

    if FS.proc is not None:
        FS.abort_process()
        return 'aborted'
    else:
        return 'was not syncing'


@app.route('/wait')
def wait():
    """
    Be notified when the next sync ends

    This will hang until the next time a sync ends successfully or not
    and then close with no body. This is useful if you need your app
    to wait until certain files are available before continuing.
    ---
    tags:
    - get
    operationId: wait
    responses:
      200:
        description: Empty
    """

    FS.wait_until_next_complete()
    return Response('', mimetype='application/octet-stream')


@app.route('/watch')
def watch():
    """
    Monitor the next sync

    This will stream log messages for the current or next sync and
    then close. When cURLing this endpoint, use '--no-buffer'.
    ---
    tags:
    - get
    operationId: watch
    responses:
      200:
        description: Streaming output in unspecified format
    """
    resp = Response(FS.stream(), mimetype='application/octet-stream')
    resp.headers['X-Accel-Buffering'] = 'no'
    return resp
