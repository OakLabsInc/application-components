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
