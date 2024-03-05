// Function to fetch Ethereum price in USD
export function getMinimaPrice(): Promise<number> {
    // URL of the API endpoint for Ethereum price
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=wrapped_minima&vs_currencies=usd';

    return new Promise((resolve, reject) => {
        // Fetch data from the API
        (window as any).MDS.net.GET(apiUrl, function(resp) {
            
            if (!resp.status) {
                reject();
            }
            console.log(resp);
                     
            const minimaPriceUSD = JSON.parse(resp.response).wrapped_minima.usd;
            // const jsonResp = JSON.parse("{\"minima\":{\"usd\":0.44}}");
            // const minimaPriceUSD = jsonResp.minima.usd;
            
            resolve(minimaPriceUSD);            
        });
    });
}

export default getMinimaPrice;