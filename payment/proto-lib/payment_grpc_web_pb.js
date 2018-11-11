/**
 * @fileoverview gRPC-Web generated client stub for oak.platform
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');


var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js')

var providers_freedompay_pb = require('./providers/freedompay_pb.js')
const proto = {};
proto.oak = {};
proto.oak.platform = require('./payment_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.oak.platform.PaymentClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.oak.platform.PaymentPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!proto.oak.platform.PaymentClient} The delegate callback based client
   */
  this.delegateClient_ = new proto.oak.platform.PaymentClient(
      hostname, credentials, options);

};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.google.protobuf.Empty,
 *   !proto.oak.platform.PaymentServiceInfo>}
 */
const methodInfo_Info = new grpc.web.AbstractClientBase.MethodInfo(
  proto.oak.platform.PaymentServiceInfo,
  /** @param {!proto.google.protobuf.Empty} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.oak.platform.PaymentServiceInfo.deserializeBinary
);


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.oak.platform.PaymentServiceInfo)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.oak.platform.PaymentServiceInfo>|undefined}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentClient.prototype.info =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/oak.platform.Payment/Info',
      request,
      metadata,
      methodInfo_Info,
      callback);
};


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.oak.platform.PaymentServiceInfo>}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentPromiseClient.prototype.info =
    function(request, metadata) {
  return new Promise((resolve, reject) => {
    this.delegateClient_.info(
      request, metadata, (error, response) => {
        error ? reject(error) : resolve(response);
      });
  });
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.oak.platform.PaymentConfiguration,
 *   !proto.google.protobuf.Empty>}
 */
const methodInfo_Configure = new grpc.web.AbstractClientBase.MethodInfo(
  google_protobuf_empty_pb.Empty,
  /** @param {!proto.oak.platform.PaymentConfiguration} request */
  function(request) {
    return request.serializeBinary();
  },
  google_protobuf_empty_pb.Empty.deserializeBinary
);


/**
 * @param {!proto.oak.platform.PaymentConfiguration} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.google.protobuf.Empty)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.google.protobuf.Empty>|undefined}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentClient.prototype.configure =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/oak.platform.Payment/Configure',
      request,
      metadata,
      methodInfo_Configure,
      callback);
};


/**
 * @param {!proto.oak.platform.PaymentConfiguration} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.google.protobuf.Empty>}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentPromiseClient.prototype.configure =
    function(request, metadata) {
  return new Promise((resolve, reject) => {
    this.delegateClient_.configure(
      request, metadata, (error, response) => {
        error ? reject(error) : resolve(response);
      });
  });
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.oak.platform.SaleRequest,
 *   !proto.oak.platform.SaleResponse>}
 */
const methodInfo_Sale = new grpc.web.AbstractClientBase.MethodInfo(
  proto.oak.platform.SaleResponse,
  /** @param {!proto.oak.platform.SaleRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.oak.platform.SaleResponse.deserializeBinary
);


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.oak.platform.SaleResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.oak.platform.SaleResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentClient.prototype.sale =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/oak.platform.Payment/Sale',
      request,
      metadata,
      methodInfo_Sale,
      callback);
};


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.oak.platform.SaleResponse>}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentPromiseClient.prototype.sale =
    function(request, metadata) {
  return new Promise((resolve, reject) => {
    this.delegateClient_.sale(
      request, metadata, (error, response) => {
        error ? reject(error) : resolve(response);
      });
  });
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.oak.platform.SaleRequest,
 *   !proto.oak.platform.SaleResponse>}
 */
const methodInfo_Auth = new grpc.web.AbstractClientBase.MethodInfo(
  proto.oak.platform.SaleResponse,
  /** @param {!proto.oak.platform.SaleRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.oak.platform.SaleResponse.deserializeBinary
);


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.oak.platform.SaleResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.oak.platform.SaleResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentClient.prototype.auth =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/oak.platform.Payment/Auth',
      request,
      metadata,
      methodInfo_Auth,
      callback);
};


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.oak.platform.SaleResponse>}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentPromiseClient.prototype.auth =
    function(request, metadata) {
  return new Promise((resolve, reject) => {
    this.delegateClient_.auth(
      request, metadata, (error, response) => {
        error ? reject(error) : resolve(response);
      });
  });
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.oak.platform.SaleRequest,
 *   !proto.oak.platform.SaleResponse>}
 */
const methodInfo_Capture = new grpc.web.AbstractClientBase.MethodInfo(
  proto.oak.platform.SaleResponse,
  /** @param {!proto.oak.platform.SaleRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.oak.platform.SaleResponse.deserializeBinary
);


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.oak.platform.SaleResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.oak.platform.SaleResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentClient.prototype.capture =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/oak.platform.Payment/Capture',
      request,
      metadata,
      methodInfo_Capture,
      callback);
};


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.oak.platform.SaleResponse>}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentPromiseClient.prototype.capture =
    function(request, metadata) {
  return new Promise((resolve, reject) => {
    this.delegateClient_.capture(
      request, metadata, (error, response) => {
        error ? reject(error) : resolve(response);
      });
  });
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.oak.platform.SaleRequest,
 *   !proto.oak.platform.SaleResponse>}
 */
const methodInfo_Cancel = new grpc.web.AbstractClientBase.MethodInfo(
  proto.oak.platform.SaleResponse,
  /** @param {!proto.oak.platform.SaleRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.oak.platform.SaleResponse.deserializeBinary
);


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.oak.platform.SaleResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.oak.platform.SaleResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentClient.prototype.cancel =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/oak.platform.Payment/Cancel',
      request,
      metadata,
      methodInfo_Cancel,
      callback);
};


/**
 * @param {!proto.oak.platform.SaleRequest} request The
 *     request proto
 * @param {!Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.oak.platform.SaleResponse>}
 *     The XHR Node Readable Stream
 */
proto.oak.platform.PaymentPromiseClient.prototype.cancel =
    function(request, metadata) {
  return new Promise((resolve, reject) => {
    this.delegateClient_.cancel(
      request, metadata, (error, response) => {
        error ? reject(error) : resolve(response);
      });
  });
};


module.exports = proto.oak.platform;

