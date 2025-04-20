import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "../artifacts/SupplyChain.json";
import '../Supply.css';

function ManufacturerDashboard() {
    const history = useHistory();
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, []);

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [MED, setMED] = useState({});
    const [MedStage, setMedStage] = useState([]);
    const [ID, setID] = useState("");

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    };

    const loadBlockchaindata = async () => {
        setloader(true);
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentaccount(account);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
            const medCtr = await supplychain.methods.medicineCtr().call();
            const med = {};
            const medStage = [];
            for (let i = 0; i < medCtr; i++) {
                med[i] = await supplychain.methods.MedicineStock(i + 1).call();
                medStage[i] = await supplychain.methods.showStage(i + 1).call();
                medStage[i] = medStage[i].replace('Medicine ', '');
            }
            setMED(med);
            setMedStage(medStage);
            setloader(false);
        } else {
            window.alert('The smart contract is not deployed to the current network');
        }
    };

    const redirect_to_home = () => {
        history.push('/');
    };

    const handlerChangeID = (event) => {
        setID(event.target.value);
    };

    const handlerSubmitManufacturing = async (event) => {
        event.preventDefault();
        try {
            const receipt = await SupplyChain.methods.Manufacturing(ID).send({ from: currentaccount });
            if (receipt) {
                loadBlockchaindata();
            }
        } catch (err) {
            alert("An error occurred!!!");
        }
    };

    if (loader) {
        return (
            <div className="loader-container">
                <h1 className="wait">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="supply-container">
            <div className="header-container">
                <span><b>Current Account Address:</b> {currentaccount}</span>
                <span onClick={redirect_to_home} className="btn btn-outline-danger btn-sm home-button">HOME</span>
            </div>
            <h2>Manufacturer Dashboard</h2>
            <h6><b>Supply Chain Flow:</b></h6>
            <p>Product Order -&gt; Raw Material Supplier -&gt; Manufacturer -&gt; Distributor -&gt; Retailer -&gt; Consumer</p>
            
            <table className="table table-sm table-dark">
                <thead>
                    <tr>
                        <th scope="col">Order ID</th>
                        <th scope="col">Product Name</th>
                        <th scope="col">Product Description</th>
                        <th scope="col">Current Processing Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(MED).map(key => (
                        <tr key={key}>
                            <td>{MED[key].id}</td>
                            <td>{MED[key].name}</td>
                            <td>{MED[key].description}</td>
                            <td>{MedStage[key]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="supply-step">
                <h5><b>Manufacture Product</b></h5>
                <form onSubmit={handlerSubmitManufacturing}>
                    <input className="form-control-sm" type="text" onChange={handlerChangeID} placeholder="Enter Order ID" required />
                    <button className="btn btn-outline-success btn-sm">Manufacture</button>
                </form>
            </div>
        </div>
    );
}

export default ManufacturerDashboard; 