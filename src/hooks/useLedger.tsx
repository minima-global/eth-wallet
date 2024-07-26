
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { listen } from "@ledgerhq/logs";
import AppBtc from "@ledgerhq/hw-app-btc";
const useLedger = () => {


    const init = async () => {
        try {
            console.log("doing it");
 
            // Keep if you chose the USB protocol
            const transport = await TransportWebUSB.create();
         
            // Keep if you chose the HID protocol
            // const transport = await TransportWebHID.create();
         
            //listen to the events which are sent by the Ledger packages in order to debug the app
            listen(log => console.log(log))
         
            //When the Ledger device connected it is trying to display the bitcoin address
            const appBtc = new AppBtc({ transport, currency: "bitcoin" });
            const { bitcoinAddress } = await appBtc.getWalletPublicKey(
              "44'/0'/0'/0/0",
              { verify: false, format: "legacy"}
            );
         

            console.log('your btc address', bitcoinAddress);
         
            //Display the address on the Ledger device and ask to verify the address
            await appBtc.getWalletPublicKey("44'/0'/0'/0/0", {format:"legacy", verify: true});

          } catch (e) {
            // log e
            console.error(e);
          }
    }

    return {
        init
    }
}


export default useLedger;