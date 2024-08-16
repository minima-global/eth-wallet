
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { listen } from "@ledgerhq/logs";

import Eth from "@ledgerhq/hw-app-eth";


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
            const appEth = new Eth(transport);
            const { address } = await appEth.getAddress(
              "44'/60'/0'/0/0"              
            );
         

            console.log('your eth address', address);
         
            

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