# Payment Sample App

This is an app that can be run on OakOS and can be used to test the Payment module.  It is a simple web page with inputs and buttons to test various transactions.

# Running

For running on a kiosk, you probably want to run at minimum 3 containers:

1. oaklabs/component-payment
2. oaklabs/payment-demo
3. [an app using @oaklabs/platform and pointed at http://0.0.0.0:9151]

The third container's responsibility is to render this webpage (2) to the Kiosk screen.  This app will communicate with (1) over the local network.

If you are successful you should see a webpage come up on the kiosk with 3 buttons: Info, Configure, and Sale.

# FreedomPay

For FreedomPay you will also have to have:

1. A Windows PC or VM running FreedomPay services
2. An ingenico IPP350 or similar device plugged into (1) via USB
3. (1) must be accessible via the network by the OakOS machine.  You will use the `configure` action on the `payment-demo` UI to tell `component-payment` what the IP address is for (1).
4. (1) must also have an active internet connection in order to contact the remote FreedomPay services.
