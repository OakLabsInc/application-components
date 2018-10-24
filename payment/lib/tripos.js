'use strict';

const fs = require('fs');
const xml2js = require('xml2js');
const request = require('request');
const crypto = require('crypto');
const url = require('url');
const _ = require('lodash');
const uuid = require('uuid');

function makeSaleRequest(config, saleData, cb) {  
  const message = {
    url: config.serviceAddress,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'tp-application-id': config.tpApplicationId,
      'tp-application-name': 'Oak Payment API',
      'tp-application-version': '1.0.0',
      'tp-authorization': 'Version='+config.tpAuthorizationVersion+', Credential='+config.tpAuthorizationCredential,
      'tp-return-logs': false
    },
    json: saleData 
  };

  createAuthHeader(message, config.tpAuthorizationCredential, config.tpAuthorizationSecret, function(err, tpAuthHeader) {
    if(err) return cb(err);
    message.headers['tp-authorization'] = tpAuthHeader;
    request(message, function(err, response, body) {
      return cb(err, body);
    });
  });
}

function createAuthHeader(message, developerKey, developerSecret, cb) {
  const algorithm = 'tp-hmac-md5';
  const nonce = uuid.v4();
  const requestDate = new Date().toISOString();
  const parsedUrl = url.parse(message.url);
  const canonicalUri = parsedUrl.path;
  const canonicalQueryStr = parsedUrl.query;
  const method = message.method;
  const bodyHash = getBodyHash(JSON.stringify(message.json));

  // 1. Get the header information
  const canonicalHeaderInfo = getCanonicalHeaderInfo(message.headers);
  const canonicalSignedHeaders = canonicalHeaderInfo.canonicalSignedHeaders;
  const canonicalHeaderStr = canonicalHeaderInfo.canonicalHeaderStr;

  // 2. Calculate the request hash
  const requestHash = getCanonicalRequestHash(
    method, canonicalUri, canonicalQueryStr, canonicalHeaderStr, canonicalSignedHeaders, bodyHash
  );

  // 3. Get the signature hash
  const keySignatureHash = getKeySignatureHash(requestDate, nonce + developerSecret);

  const unhashedSignature = algorithm.toUpperCase() + '\n' + requestDate + '\n' + developerKey + '\n' + requestHash;

  // 4. Get the actual auth signature
  const signature = getKeySignatureHash(keySignatureHash, unhashedSignature);

  // 5. Create the auth header
  const tpAuthorization = [
    'Version=1.0', 
    'Algorithm='+algorithm.toUpperCase(), 
    'Credential='+developerKey, 
    'SignedHeaders='+canonicalSignedHeaders, 
    'Nonce='+nonce,
    'RequestDate='+requestDate,
    'Signature='+signature
  ].join(',');

  return cb(null, tpAuthorization);
}

function getBodyHash(body) {
  return crypto.createHash('md5').update(
    new Buffer(body, 'utf8')
  ).digest('hex');
}

function getCanonicalHeaderInfo(headers) {
  let canonicalSignedHeaders = [];
  let canonicalHeaders = {};
  let uniqHeaders = [];
  _.each(headers, function(v, k) {
    if(k.indexOf('tp-') === 0) return;
    canonicalSignedHeaders.push(k);
    if(uniqHeaders.indexOf(k) === -1) {
      // uniq
      uniqHeaders.push(k);
      canonicalHeaders[k] = [v];
    } else {
      // not uniq
      canonicalHeaders[k].push(v);
    }
  });
  canonicalSignedHeaders = canonicalSignedHeaders.sort().join(';');

  //each canonicalHeader is its own line in a multiline string
  let canonicalHeaderStr = '';
  let canonicalHeaderArray = [];
  _.each(canonicalHeaders, function(v, k) {
    canonicalHeaderArray.push(k+':'+v.join(', '));
  });

  canonicalHeaderStr = canonicalHeaderArray.sort().join('\n');

  return {
    canonicalSignedHeaders: canonicalSignedHeaders,
    canonicalHeaderStr: canonicalHeaderStr
  }
}

function getCanonicalRequestHash(method, uri, query, headerStr, signedHeaderStr, bodyHash) {
  let canonicalRequest = method + '\n';
  canonicalRequest += uri + '\n';
  if(query === null) query = '';
  canonicalRequest += query + '\n';
  canonicalRequest += headerStr + '\n';
  canonicalRequest += signedHeaderStr + '\n';
  canonicalRequest += bodyHash;

  return crypto.createHash('md5').update(
    new Buffer(canonicalRequest, 'utf8')
  ).digest('hex');
}

function getKeySignatureHash(key, data) {
  return crypto.createHmac(
    'md5',
    new Buffer(key, 'utf8')
  ).update(
    new Buffer(data, 'utf8')
  ).digest('hex');
}

exports.makeSaleRequest = makeSaleRequest;
