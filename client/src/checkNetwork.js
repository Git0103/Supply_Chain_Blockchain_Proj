import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";

async function checkNetwork() {
    try {
        console.log("Checking network...");
        
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            console.log("MetaMask connected");
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            console.log("Using existing Web3 provider");
        } else {
            console.error("No Web3 provider found");
            return;
        }
        
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log("Current account:", account);
        
        const networkId = await web3.eth.net.getId();
        console.log("Network ID:", networkId);
        
        const networkData = SupplyChainABI.networks[networkId];
        console.log("Network data:", networkData ? "Found" : "Not found");
        
        if (networkData) {
            console.log("Contract address:", networkData.address);
            const contract = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            
            // Check if contract is deployed
            try {
                const rmsCount = await contract.methods.rmsCtr().call();
                console.log("RMS count:", rmsCount);
                console.log("Contract is deployed and accessible");
            } catch (err) {
                console.error("Error calling contract method:", err);
            }
        } else {
            console.error("Contract not deployed to current network");
        }
    } catch (err) {
        console.error("Error checking network:", err);
    }
}

// Run the check
checkNetwork(); 