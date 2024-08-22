const instance = await NftMarket.deployed();

instance.mintToken("https://chocolate-near-bedbug-866.mypinata.cloud/ipfs/QmP9ifAQTdg7xg6JVUnLK8s1eLjLV4g5LJP8Cm2tF2Xpoi","500000000000000000", {value: "25000000000000000",from: accounts[0]})

instance.mintToken("https://chocolate-near-bedbug-866.mypinata.cloud/ipfs/Qma5jzPnYrtDNpsTAzQvKDnBUrmfNPzmq59Ci5zELeNm4B","500000000000000000",{value: "25000000000000000",from: accounts[0]})