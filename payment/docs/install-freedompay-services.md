# FreedomPay Testing Service Installation

1. Download [Freedompay Server and Client installer](https://storage.cloud.google.com/oak-payments/FCC_4.1.4.38.zip).
2. Once install is complete look for notepad in explorer, right click and run as admin (this step will save you time)
3. In Notepad, click File->Open (do this method for the rest of the steps below) and open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\servers.xml`
4. Confirm that FigaroServer is configured accordingly `<FigaroServer server="127.0.01" port="3391" />`. Update this field if you have to then save.
5. File->Open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\FreewayServerService.exe.config`
6. Confirm that `operationMode` is configured correctly. `<add key="operationMode" value="standalone" />`. Update this field if needed then save.
7. File->Open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\FreeWayClientService.exe.config`
8. Update the following `freewayUrl` and `CardStorUrl` to the following: `<add key="freewayUrl" value="https://cs.uat.freedompay.com/Freeway/Service.asmx />` and `<add key="cardStorUrl" value="https://cs.uat.freedompay.com/CardStor/CardStorService.asmx" />`. This update adds "uat" after `https://cs.`. Update and save.
9. Finally open `C:\Program Files(x86)\FreedomPay\FreewayCommerceConnect\FreeWayServerService.exe.config`
10. Update `freewayUrl` like the last step. `<add key="freewayServer" value="https://cs.uat.freedompay.com/" />`. Also add "uat" to the domain before `https://cs.`. Update and save.
11. Restart the FCC client and server services in Computer Management to make these changes take effect.

# FreedomPay Production Service Installation

1.  Follow steps above, with exceptions noted below.
2.  On steps 8 and 10, instead of the root domain being "https://cs.uat.freedompay.com" it will be "https://cs.freedompay.us"
