# Obtaining Device Management Portal Activation Keys

FreedomPay’s Device Management Portal (DMP) allows for enabling features such as automatic tracking of connected devices, scheduling device firmware and data package updates, and updating device image content. In order to take advantage of these features, the FCC install must be registered using an activation key. Registration is not required, but is strongly suggested.

*Note that DMP features are restricted to versions 4.1.3.6 and later.

DMP Activation Keys can be obtained through the Enterprise Portal. If you do not have access to the Enterprise Portal, please contact your Account Manager to have an account created for you. Once you have logged into the Enterprise Portal, hover over the Device Management drop down in the top left corner of the page, and select Manage Activation Keys.

To generate a new key, click Generate. A new key will be added to the list of available keys, and display the number of activations that have been claimed on that key. Multiple FCC installs can be activated on the same key.

This key will be used later in the install process.

# FreedomPay Testing Service Installation

1. Log into the google account `zivelodocs@gmail.com`.  See Zivelo tech team for the password.
2. Download [Freedompay Server and Client installer](https://storage.cloud.google.com/oak-payments/FCC_4.1.4.38.zip).
3. Once install is complete look for notepad in explorer, right click and run as admin (this step will save you time)
4. In Notepad, click File->Open (do this method for the rest of the steps below) and open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\servers.xml`
5. Confirm that FigaroServer is configured accordingly `<FigaroServer server="127.0.01" port="3391" />`. Update this field if you have to then save.
6. File->Open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\FreewayServerService.exe.config`
7. Confirm that `operationMode` is configured correctly. `<add key="operationMode" value="standalone" />`. Update this field if needed then save.
8. File->Open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\FreeWayClientService.exe.config`
9. Update the following `freewayUrl` and `CardStorUrl` to the following: `<add key="freewayUrl" value="https://cs.uat.freedompay.com/Freeway/Service.asmx />` and `<add key="cardStorUrl" value="https://cs.uat.freedompay.com/CardStor/CardStorService.asmx" />`. This update adds "uat" after `https://cs.`. Update and save.
10. Finally open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\FreeWayServerService.exe.config`
11. Update `freewayUrl` like the last step. `<add key="freewayServer" value="https://cs.uat.freedompay.com/" />`. Also add "uat" to the domain before `https://cs.`. Update and save.
12. Restart the FCC client and server services in Computer Management to make these changes take effect.

# FreedomPay Production Service Installation

1.  Follow steps above, with exceptions noted below.
2.  On steps 8 and 10, instead of the root domain being "https://cs.uat.freedompay.com" it will be "https://cs.freedompay.us"
