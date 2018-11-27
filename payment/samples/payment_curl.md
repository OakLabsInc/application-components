# Payment Container Curl Examples

Here are some basic sale tests converted to cURL.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"providers":[{"provider_name":"freedompay","provider_type":"FREEDOMPAY","host":"http://192.168.1.12:1011","location_id":"1460175013","terminal_id":"2463834019"}]}' 0.0.0.0:9143/api/payment/configure
```

```bash
curl -X POST 0.0.0.0:9143/api/payment/info
```

```bash
curl -X POST -H "Content-Type: application/json" -d '{"sale_request": {"provider_name": "freedompay", "merchant_ref": "00001", "invoice_number": "00001", "amount": "10.50"}}' 0.0.0.0:9143/api/payment/sale
```
