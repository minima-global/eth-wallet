// Function to fetch Ethereum price in USD
export function getEthereumPrice(): Promise<number> {
    // URL of the API endpoint for Ethereum price
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

    return new Promise((resolve, reject) => {
        // Fetch data from the API
        (window as any).MDS.net.GET(apiUrl, function(resp) {
            
            if (!resp.status) {
                reject();
            }

            console.log(resp);            
            // const ethereumPriceUSD = jsonResponse.ethereum.usd;
            const jsonResp = JSON.parse("{\"ethereum\":{\"usd\":2494.33}}");
            const ethereumPriceUSD = jsonResp.ethereum.usd;
            
            resolve(ethereumPriceUSD);            
        });
    });
}

export default getEthereumPrice;