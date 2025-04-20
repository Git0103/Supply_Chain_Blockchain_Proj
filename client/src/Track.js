import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
// import {QRCode} from 'qrcode.react'
import { QRCodeCanvas } from 'qrcode.react';
import './Track.css';

function Track() {
    const history = useHistory()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [MED, setMED] = useState();
    const [MedStage, setMedStage] = useState();
    const [ID, setID] = useState();
    const [RMS, setRMS] = useState();
    const [MAN, setMAN] = useState();
    const [DIS, setDIS] = useState();
    const [RET, setRET] = useState();
    const [TrackTillSold, showTrackTillSold] = useState(false);
    const [TrackTillRetail, showTrackTillRetail] = useState(false);
    const [TrackTillDistribution, showTrackTillDistribution] = useState(false);
    const [TrackTillManufacture, showTrackTillManufacture] = useState(false);
    const [TrackTillRMS, showTrackTillRMS] = useState(false);
    const [TrackTillOrdered, showTrackTillOrdered] = useState(false);
    const [scannedQRCode, setScannedQRCode] = useState("");

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                "Non-Ethereum browser detected. You should consider trying MetaMask!"
            );
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
            var i;
            const medCtr = await supplychain.methods.medicineCtr().call();
            const med = {};
            const medStage = [];
            for (i = 0; i < medCtr; i++) {
                med[i + 1] = await supplychain.methods.MedicineStock(i + 1).call();
                medStage[i + 1] = await supplychain.methods.showStage(i + 1).call();
                medStage[i + 1] = medStage[i + 1].replace('Medicine ', '');
            }
            setMED(med);
            setMedStage(medStage);
            const rmsCtr = await supplychain.methods.rmsCtr().call();
            const rms = {};
            for (i = 0; i < rmsCtr; i++) {
                rms[i + 1] = await supplychain.methods.RMS(i + 1).call();
            }
            setRMS(rms);
            const manCtr = await supplychain.methods.manCtr().call();
            const man = {};
            for (i = 0; i < manCtr; i++) {
                man[i + 1] = await supplychain.methods.MAN(i + 1).call();
            }
            setMAN(man);
            const disCtr = await supplychain.methods.disCtr().call();
            const dis = {};
            for (i = 0; i < disCtr; i++) {
                dis[i + 1] = await supplychain.methods.DIS(i + 1).call();
            }
            setDIS(dis);
            const retCtr = await supplychain.methods.retCtr().call();
            const ret = {};
            for (i = 0; i < retCtr; i++) {
                ret[i + 1] = await supplychain.methods.RET(i + 1).call();
            }
            setRET(ret);
            setloader(false);
        }
        else {
            window.alert('The smart contract is not deployed to current network')
        }
    }
    if (loader) {
        return (
            <div>
                <h1 className="wait">Loading...</h1>
            </div>
        )
    }
    if (TrackTillSold) {
        const productData = {
            id: MED[ID]?.id,
            name: MED[ID]?.name,
            description: MED[ID]?.description,
            currentStage: MedStage[ID],
            status: "Sold"
        };

        const productDataString = JSON.stringify(productData);
        
        return (
            <div className="container-xl">
                <article className="col-4">
                    <h3><b><u>Battery:</u></b></h3>
                    <span><b>Order ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                </article>
                <hr />
                <br />
                <section className="row">

                    <article className="col-3">
                        <h4><u>Raw Materials Supplied by:</u></h4>
                        <p><b>Supplier ID: </b>{RMS[MED[ID].RMSid].id}</p>
                        <p><b>Name:</b> {RMS[MED[ID].RMSid].name}</p>
                        <p><b>Place: </b>{RMS[MED[ID].RMSid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Manufactured by:</u></h4>
                        <p><b>Manufacturer ID: </b>{MAN[MED[ID].MANid].id}</p>
                        <p><b>Name:</b> {MAN[MED[ID].MANid].name}</p>
                        <p><b>Place: </b>{MAN[MED[ID].MANid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Distributed by:</u></h4>
                        <p><b>Distributor ID: </b>{DIS[MED[ID].DISid].id}</p>
                        <p><b>Name:</b> {DIS[MED[ID].DISid].name}</p>
                        <p><b>Place: </b>{DIS[MED[ID].DISid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Retailed by:</u></h4>
                        <p><b>Retailer ID: </b>{RET[MED[ID].RETid].id}</p>
                        <p><b>Name:</b> {RET[MED[ID].RETid].name}</p>
                        <p><b>Place: </b>{RET[MED[ID].RETid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Sold</u></h4>
                    </article>
                </section>
                <div className="qr-code-container mt-4">
                    <h4>Product QR Code:</h4>
                    <QRCodeCanvas 
                        value={productDataString} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="mt-2"><small>Scan this QR code to track this product</small></p>
                </div>
                <button onClick={() => {
                    showTrackTillSold(false);
                }} className="btn btn-outline-success btn-sm">Track Another Item</button>
                <span onClick={() => {
                    history.push('/')
                }} className="btn btn-outline-danger btn-sm"> HOME</span>
            </div >
        )
    }
    if (TrackTillRetail) {
        const productData = {
            id: MED[ID]?.id,
            name: MED[ID]?.name,
            description: MED[ID]?.description,
            currentStage: MedStage[ID],
            status: "At Retailer"
        };

        const productDataString = JSON.stringify(productData);
        
        return (
            <div className="container-xl">
                <article className="col-4">
                    <h3><b><u>Product:</u></b></h3>
                    <span><b>Order ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                </article>
                <hr />
                <br />
                <section className="row">

                    <article className="col-3">
                        <h4><u>Raw Materials Supplied by:</u></h4>
                        <p><b>Supplier ID: </b>{RMS[MED[ID].RMSid].id}</p>
                        <p><b>Name:</b> {RMS[MED[ID].RMSid].name}</p>
                        <p><b>Place: </b>{RMS[MED[ID].RMSid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Manufactured by:</u></h4>
                        <p><b>Manufacturer ID: </b>{MAN[MED[ID].MANid].id}</p>
                        <p><b>Name:</b> {MAN[MED[ID].MANid].name}</p>
                        <p><b>Place: </b>{MAN[MED[ID].MANid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Distributed by:</u></h4>
                        <p><b>Distributor ID: </b>{DIS[MED[ID].DISid].id}</p>
                        <p><b>Name:</b> {DIS[MED[ID].DISid].name}</p>
                        <p><b>Place: </b>{DIS[MED[ID].DISid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Retailed by:</u></h4>
                        <p><b>Retailer ID: </b>{RET[MED[ID].RETid].id}</p>
                        <p><b>Name:</b> {RET[MED[ID].RETid].name}</p>
                        <p><b>Place: </b>{RET[MED[ID].RETid].place}</p>
                    </article>
                </section>
                <div className="qr-code-container mt-4">
                    <h4>Product QR Code:</h4>
                    <QRCodeCanvas 
                        value={productDataString} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="mt-2"><small>Scan this QR code to track this product</small></p>
                </div>
                <button onClick={() => {
                    showTrackTillRetail(false);
                }} className="btn btn-outline-success btn-sm">Track Another Item</button>
                <span onClick={() => {
                    history.push('/')
                }} className="btn btn-outline-danger btn-sm"> HOME</span>
            </div >
        )
    }
    if (TrackTillDistribution) {
        const productData = {
            id: MED[ID]?.id,
            name: MED[ID]?.name,
            description: MED[ID]?.description,
            currentStage: MedStage[ID],
            status: "At Distributor"
        };

        const productDataString = JSON.stringify(productData);
        
        return (
            <div className="container-xl">
                <article className="col-4">
                    <h3><b><u>Product:</u></b></h3>
                    <span><b>Order ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                </article>
                <hr />
                <br />
                <section className="row">

                    <article className="col-3">
                        <h4><u>Raw Materials Supplied by:</u></h4>
                        <p><b>Supplier ID: </b>{RMS[MED[ID].RMSid].id}</p>
                        <p><b>Name:</b> {RMS[MED[ID].RMSid].name}</p>
                        <p><b>Place: </b>{RMS[MED[ID].RMSid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Manufactured by:</u></h4>
                        <p><b>Manufacturer ID: </b>{MAN[MED[ID].MANid].id}</p>
                        <p><b>Name:</b> {MAN[MED[ID].MANid].name}</p>
                        <p><b>Place: </b>{MAN[MED[ID].MANid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Distributed by:</u></h4>
                        <p><b>Distributor ID: </b>{DIS[MED[ID].DISid].id}</p>
                        <p><b>Name:</b> {DIS[MED[ID].DISid].name}</p>
                        <p><b>Place: </b>{DIS[MED[ID].DISid].place}</p>
                    </article>
                </section>
                <div className="qr-code-container mt-4">
                    <h4>Product QR Code:</h4>
                    <QRCodeCanvas 
                        value={productDataString} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="mt-2"><small>Scan this QR code to track this product</small></p>
                </div>
                <button onClick={() => {
                    showTrackTillDistribution(false);
                }} className="btn btn-outline-success btn-sm">Track Another Item</button>
                <span onClick={() => {
                    history.push('/')
                }} className="btn btn-outline-danger btn-sm"> HOME</span>
            </div >
        )
    }
    if (TrackTillManufacture) {
        const productData = {
            id: MED[ID]?.id,
            name: MED[ID]?.name,
            description: MED[ID]?.description,
            currentStage: MedStage[ID],
            status: "At Manufacturer"
        };

        const productDataString = JSON.stringify(productData);
        
        return (
            <div className="container-xl">
                <article className="col-4">
                    <h3><b><u>Product:</u></b></h3>
                    <span><b>Order ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                </article>
                <hr />
                <br />
                <section className="row">

                    <article className="col-3">
                        <h4><u>Raw Materials Supplied by:</u></h4>
                        <p><b>Supplier ID: </b>{RMS[MED[ID].RMSid].id}</p>
                        <p><b>Name:</b> {RMS[MED[ID].RMSid].name}</p>
                        <p><b>Place: </b>{RMS[MED[ID].RMSid].place}</p>
                    </article>
                    <span>&#10132;</span>
                    <article className="col-3">
                        <h4><u>Manufactured by:</u></h4>
                        <p><b>Manufacturer ID: </b>{MAN[MED[ID].MANid].id}</p>
                        <p><b>Name:</b> {MAN[MED[ID].MANid].name}</p>
                        <p><b>Place: </b>{MAN[MED[ID].MANid].place}</p>
                    </article>
                </section>
                <div className="qr-code-container mt-4">
                    <h4>Product QR Code:</h4>
                    <QRCodeCanvas 
                        value={productDataString} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="mt-2"><small>Scan this QR code to track this product</small></p>
                </div>
                <button onClick={() => {
                    showTrackTillManufacture(false);
                }} className="btn btn-outline-success btn-sm">Track Another Item</button>
                <span onClick={() => {
                    history.push('/')
                }} className="btn btn-outline-danger btn-sm"> HOME</span>
            </div >
        )
    }
    if (TrackTillRMS) {
        const productData = {
            id: MED[ID]?.id,
            name: MED[ID]?.name,
            description: MED[ID]?.description,
            currentStage: MedStage[ID],
            status: "At Raw Material Supplier"
        };

        const productDataString = JSON.stringify(productData);
        
        return (
            <div className="container-xl">
                <article className="col-4">
                    <h3><b><u>Product:</u></b></h3>
                    <span><b>Order ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                </article>
                <hr />
                <br />
                <section className="row">

                    <article className="col-3">
                        <h4><u>Raw Materials Supplied by:</u></h4>
                        <p><b>Supplier ID: </b>{RMS[MED[ID].RMSid].id}</p>
                        <p><b>Name:</b> {RMS[MED[ID].RMSid].name}</p>
                        <p><b>Place: </b>{RMS[MED[ID].RMSid].place}</p>
                    </article>
                </section>
                <div className="qr-code-container mt-4">
                    <h4>Product QR Code:</h4>
                    <QRCodeCanvas 
                        value={productDataString} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="mt-2"><small>Scan this QR code to track this product</small></p>
                </div>
                <button onClick={() => {
                    showTrackTillRMS(false);
                }} className="btn btn-outline-success btn-sm">Track Another Item</button>
                <span onClick={() => {
                    history.push('/')
                }} className="btn btn-outline-danger btn-sm"> HOME</span>
            </div >
        )
    }
    if (TrackTillOrdered) {
      const batteryData = {
        id: MED[ID]?.id,
        name: MED[ID]?.name,
        description: MED[ID]?.description,
        currentStage: MedStage[ID]
      };

      const batteryDataString = JSON.stringify(batteryData);
        return (
            <div className="container-xl">
                <article className="col-4">
                    <h3><b><u>Product:</u></b></h3>
                    <span><b>Order ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                    <hr />
                    <br />
                    <h5>Order Not Yet Processed...</h5>
                    <button onClick={() => {
                        showTrackTillOrdered(false);
                    }} className="btn btn-outline-success btn-sm">Track Another Item</button>
                    <span onClick={() => {
                        history.push('/')
                    }} className="btn btn-outline-danger btn-sm"> HOME</span>
                </article>
                <div className="qr-code-container">
                    <h4>QR Code:</h4>
                    <QRCodeCanvas 
                        value={batteryDataString} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="mt-2"><small>Scan this QR code to track this product</small></p>
                </div>
            </div>
        )
    }
    const handlerChangeID = (event) => {
        setID(event.target.value);
    }
    const redirect_to_home = () => {
        history.push('/')
    }
    const handlerSubmit = async (event) => {
        event.preventDefault();
        var ctr = await SupplyChain.methods.medicineCtr().call();
        if (!((ID > 0) && (ID <= ctr)))
            alert("Invalid Battery ID!!!");
        else {
            // eslint-disable-next-line
            if (MED[ID].stage == 5)
                showTrackTillSold(true);
            // eslint-disable-next-line
            else if (MED[ID].stage == 4)
                showTrackTillRetail(true);
            // eslint-disable-next-line
            else if (MED[ID].stage == 3)
                showTrackTillDistribution(true);
            // eslint-disable-next-line
            else if (MED[ID].stage == 2)
                showTrackTillManufacture(true);
            // eslint-disable-next-line
            else if (MED[ID].stage == 1)
                showTrackTillRMS(true);
            else
                showTrackTillOrdered(true);

        }
    }

    const handleQRCodeScan = (data) => {
        if (data) {
            try {
                // Try to parse the scanned data as JSON
                const productData = JSON.parse(data);
                
                // Set the scanned QR code value
                setScannedQRCode(data);
                
                // Set the ID from the product data
                if (productData.id) {
                    setID(productData.id);
                    
                    // Automatically trigger tracking when QR code is scanned
                    const event = { preventDefault: () => {} };
                    handlerSubmit(event);
                } else {
                    alert("Invalid QR code: Missing product ID");
                }
            } catch (error) {
                // If parsing fails, try to use the raw data as ID (for backward compatibility)
                console.error("Error parsing QR code data:", error);
                setScannedQRCode(data);
                setID(data);
                
                // Automatically trigger tracking when QR code is scanned
                const event = { preventDefault: () => {} };
                handlerSubmit(event);
            }
        }
    }

    const handleQRCodeError = (error) => {
        console.error(error);
    }

    return (
        <div>
            <span><b>Current Account Address:</b> {currentaccount}</span>
            <span onClick={redirect_to_home} className="btn btn-outline-danger btn-sm"> HOME</span>
            
            <div className="qr-scanner-container mb-4">
                <h5>Scan QR Code to Track Product</h5>
                <div className="qr-scanner">
                    <QRCodeCanvas
                        value={scannedQRCode}
                        size={256}
                        level={"H"}
                        includeMargin={true}
                    />
                </div>
            </div>

            <table className="table table-sm table-bordered">
                <thead>
                    <tr>
                        <th scope="col">Order ID</th>
                        <th scope="col">Product Name</th>
                        <th scope="col">Product Description</th>
                        <th scope="col">Current Processing Stage</th>
                        <th scope="col">QR Code</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(MED).map(function (key) {
                        // Create a JSON object with all relevant product information
                        const productData = {
                            id: MED[key].id,
                            name: MED[key].name,
                            description: MED[key].description,
                            stage: MedStage[key]
                        };
                        
                        // Convert to JSON string for QR code
                        const qrValue = JSON.stringify(productData);
                        
                        return (
                            <tr key={key}>
                                <td>{MED[key].id}</td>
                                <td>{MED[key].name}</td>
                                <td>{MED[key].description}</td>
                                <td>{MedStage[key]}</td>
                                <td>
                                    <QRCodeCanvas
                                        value={qrValue}
                                        size={128}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <h5>Enter Order ID to Track it</h5>

            <form onSubmit={handlerSubmit}>
                <input 
                    className="form-control-sm" 
                    type="text" 
                    onChange={handlerChangeID} 
                    placeholder="Enter Order ID" 
                    value={ID || ''}
                    required 
                />
                <button className="btn btn-outline-success btn-sm" type="submit">Track</button>
            </form>
        </div>
    )
}

export default Track
