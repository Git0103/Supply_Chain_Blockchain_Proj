import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import './Home.css'

function Home() {
    const history = useHistory();
    const [clicked, setClicked] = useState(false);
    const [currentAccount, setCurrentAccount] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState("");

    useEffect(() => {
        loadWeb3();
    }, []);

    const loadWeb3 = async () => {
        try {
            setDebugInfo(prev => prev + "Starting Web3 connection...\n");
            if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                await window.ethereum.enable();
                setDebugInfo(prev => prev + "MetaMask connected successfully\n");
                loadBlockchainData();
            } else if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
                setDebugInfo(prev => prev + "Using existing Web3 provider\n");
                loadBlockchainData();
            } else {
                setError("Non-Ethereum browser detected. Consider using MetaMask!");
                setLoading(false);
                setDebugInfo(prev => prev + "No Web3 provider found\n");
            }
        } catch (err) {
            setError("Error connecting to Web3: " + err.message);
            setLoading(false);
            setDebugInfo(prev => prev + "Error in loadWeb3: " + err.message + "\n");
        }
    };

    const loadBlockchainData = async () => {
        try {
            setLoading(true);
            setDebugInfo(prev => prev + "Loading blockchain data...\n");
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            setCurrentAccount(account);
            setDebugInfo(prev => prev + "Current account: " + account + "\n");

            const networkId = await web3.eth.net.getId();
            setDebugInfo(prev => prev + "Network ID: " + networkId + "\n");
            
            const networkData = SupplyChainABI.networks[networkId];
            setDebugInfo(prev => prev + "Network data: " + (networkData ? "Found" : "Not found") + "\n");

            if (networkData) {
                const contract = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
                setDebugInfo(prev => prev + "Contract address: " + networkData.address + "\n");

                // Check user roles
                const rmsCount = await contract.methods.rmsCtr().call();
                const manCount = await contract.methods.manCtr().call();
                const disCount = await contract.methods.disCtr().call();
                const retCount = await contract.methods.retCtr().call();
                
                setDebugInfo(prev => prev + `Role counts - RMS: ${rmsCount}, MAN: ${manCount}, DIS: ${disCount}, RET: ${retCount}\n`);

                // Check if user is RMS
                for (let i = 0; i < rmsCount; i++) {
                    const rms = await contract.methods.RMS(i + 1).call();
                    if (rms.addr.toLowerCase() === account.toLowerCase()) {
                        setUserRole('rms');
                        setDebugInfo(prev => prev + "User is RMS\n");
                        break;
                    }
                }

                // Check if user is Manufacturer
                if (!userRole) {
                    for (let i = 0; i < manCount; i++) {
                        const man = await contract.methods.MAN(i + 1).call();
                        if (man.addr.toLowerCase() === account.toLowerCase()) {
                            setUserRole('manufacturer');
                            setDebugInfo(prev => prev + "User is Manufacturer\n");
                            break;
                        }
                    }
                }

                // Check if user is Distributor
                if (!userRole) {
                    for (let i = 0; i < disCount; i++) {
                        const dis = await contract.methods.DIS(i + 1).call();
                        if (dis.addr.toLowerCase() === account.toLowerCase()) {
                            setUserRole('distributor');
                            setDebugInfo(prev => prev + "User is Distributor\n");
                            break;
                        }
                    }
                }

                // Check if user is Retailer
                if (!userRole) {
                    for (let i = 0; i < retCount; i++) {
                        const ret = await contract.methods.RET(i + 1).call();
                        if (ret.addr.toLowerCase() === account.toLowerCase()) {
                            setUserRole('retailer');
                            setDebugInfo(prev => prev + "User is Retailer\n");
                            break;
                        }
                    }
                }

                if (!userRole) {
                    setDebugInfo(prev => prev + "User has no registered role\n");
                }

                setLoading(false);
            } else {
                setError('The smart contract is not deployed to the current network');
                setLoading(false);
                setDebugInfo(prev => prev + "Contract not deployed to current network\n");
            }
        } catch (err) {
            setError("Error loading blockchain data: " + err.message);
            setLoading(false);
            setDebugInfo(prev => prev + "Error in loadBlockchainData: " + err.message + "\n");
        }
    };

    const redirectTo = (path) => {
        setClicked(true);
        setTimeout(() => {
            setClicked(false);
            history.push(path);
        }, 500);
    }

    if (loading) {
        return (
            <div className="loader-container">
                <h1 className="wait">Loading...</h1>
                <p>Please make sure MetaMask is installed and connected to the correct network.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <h3>Error</h3>
                    <div style={styles.errorContainer}>
                        <p>{error}</p>
                        <button 
                            className="fancyButton" 
                            onClick={loadWeb3}
                        >
                            Retry Connection
                        </button>
                    </div>
                    <div style={styles.debugContainer}>
                        <h5>Debug Information:</h5>
                        <pre style={styles.debugInfo}>{debugInfo}</pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <h3>Supply Chain Manager</h3>
                <div style={styles.accountInfo}>
                    <p><b>Current Account:</b> {currentAccount}</p>
                    {userRole && <p><b>Your Role:</b> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>}
                </div>
                <div style={styles.buttonGroup}>
                    <button 
                        className={`fancyButton ${clicked ? 'burst' : ''}`} 
                        onClick={() => redirectTo('/roles')}
                    >
                        Register Roles
                    </button>
                    <button 
                        className={`fancyButton ${clicked ? 'burst' : ''}`} 
                        onClick={() => redirectTo('/addmed')}
                    >
                        Order Materials
                    </button>
                    <button 
                        className={`fancyButton ${clicked ? 'burst' : ''}`} 
                        onClick={() => redirectTo('/track')}
                    >
                        Track Materials
                    </button>
                    {userRole === 'rms' && (
                        <button 
                            className={`fancyButton ${clicked ? 'burst' : ''}`} 
                            onClick={() => redirectTo('/rms-dashboard')}
                        >
                            Raw Material Supplier Dashboard
                        </button>
                    )}
                    {userRole === 'manufacturer' && (
                        <button 
                            className={`fancyButton ${clicked ? 'burst' : ''}`} 
                            onClick={() => redirectTo('/manufacturer-dashboard')}
                        >
                            Manufacturer Dashboard
                        </button>
                    )}
                    {userRole === 'distributor' && (
                        <button 
                            className={`fancyButton ${clicked ? 'burst' : ''}`} 
                            onClick={() => redirectTo('/distributor-dashboard')}
                        >
                            Distributor Dashboard
                        </button>
                    )}
                    {userRole === 'retailer' && (
                        <button 
                            className={`fancyButton ${clicked ? 'burst' : ''}`} 
                            onClick={() => redirectTo('/retailer-dashboard')}
                        >
                            Retailer Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: 'url("https://example.com/battery_background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px',
    },
    content: {
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
        maxWidth: '500px',
        width: '100%',
    },
    accountInfo: {
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '5px',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginTop: '30px',
    },
    errorContainer: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: '5px',
        color: 'red',
    },
    debugContainer: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '5px',
        textAlign: 'left',
    },
    debugInfo: {
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        maxHeight: '200px',
        overflow: 'auto',
    }
}

export default Home;
