# Payments

The payments module provides credit and debit card scanning capabilities to a kiosk application.  Current supported payment providers are:

* FreedomPay
* WorldPay

# Getting Started

First you will need to determine the payment gateway that you would like your app to use.  If you need help selecting a payment gateway, talk to your representative at Zivelo.  They can inform you about the various options.

Once you've selected a payment provider, you'll need to make sure you have the hardware that you need.  All payment providers have card scanners and local services that will need to run on the same network as your kiosk app.  Depending on the provider, some of these services may require their own physical machine due to Operating Systems dependencies or PCI requirements.  Consult the documentation for your specific payment provider for details on setting this up.

[FreedomPay Setup](/docs/freedompay-setup.md)

# Using Our Payment Demo App

Once you have your card scanner and provider services set up, you're ready to test with our demo app.  This will help you ensure that everything is connected properly, and to troubleshoot any issues in a simplified and well known environment.

You can find [instructions for the demo app here](https://github.com/OakLabsInc/payment-demo/).

# Testing With Your App

In OakOS you can run this module along side your app by adding it to the configuration you send to `/application/install`:

```json
{
  "services": [
    {
      "image": "index.docker.io/oaklabs/component-payment:0.0.11",
      "username": "{{dockerUsername}}",
      "password": "{{dockerPassword}}"
    },
    {
      "image": "[your-app-here]",
      "username": "{{dockerUsername}}",
      "password": "{{dockerPassword}}"
    }
  ]
}
```

# API Documentation

