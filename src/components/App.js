import React, { Component } from 'react'
//import getWeb3 from '../getWeb3';
import Navbar from './Navbar';
import Web3 from 'web3';
import Main from './Main';
import HydroAbi from '../abis/hydro.json';
import EthToBscAbi from '../abis/ethToBsc.json';
import BscToEthAbi from '../abis/bscToEth.json';
import BepHydro from '../abis/bephydro.json';
import './App.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




class App extends Component {

  state = {
    account: '',
    hydroBalance: '0',
    bepBalance: '0',
    allowedHydro: '0',
    allowedBep: '0',
    loading: true,
    hydroInstance: null,
    web3: null,
    hydroAddress: null,
    bepHydroAddress: null,
    ethToBscInstance: null,
    BscToEthInstance: null,
    bepHydroInstance: null,
    currentForm: '',

    swapAddress:'',
    swapInstance:[],
    totalSwapped:0,
    allowed:0,
    eth_allowed:0,
    blockNumber:0,
    networkID:0,
    text:'',
    wrongNetwork:'',
    API_LINK:'',
    loading_text:'',
    txHash:'',
    tx_Link:'',
    prev_hash:0,
    swapping:false,
    
   
  }

  componentDidMount = async () => {
    try {
     
      let ethereum= window.ethereum;
      let web3=window.web3;
    

      if(typeof ethereum !=='undefined'){
       await ethereum.enable();
       web3 = new Web3(ethereum); 
       this.setState({web3})      
      }

      else if (typeof web3 !== 'undefined'){
      console.log('Web3 Detected!')
      window.web3 = new Web3(web3.currentProvider);
      this.setState({web3})
      }
   
      else{console.log('No Web3 Detected')
      window.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));  
      this.setState({web3})
    }  
      const networkID = await web3.eth.net.getId();
      this.setState({networkID:networkID})
      
      if(this.state.networkID === 56){
        this.load_Hydro_Bsc(this.state.web3)
        this.getGasPrice()
      }

      else if(this.state.networkID === 1){
        this.load_Hydro_Eth(this.state.web3)
      }

      else{
        const currrentNetwork = await this.state.web3.eth.net.getNetworkType();
        this.setState({wrongNetwork:'You are on ' + currrentNetwork + ' Network, Please switch to Ethereum Main Net or BSC Network'})
      }


      window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
         })
       
      window.ethereum.on('chainChanged', function (netId) {
        window.location.reload();
         })
    
    } catch (error) {
        this.setState({
        loading: false
      })
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

  
  };

  getGasPrice(){
    
    let address  = this.state.account;
    let gasURL = 'https://hydro-bridge-backend.org/api/get_hydro_price/'
    console.log(this.state.account)
    const requestOptions = {
      method:'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': process.env.REACT_APP_API_KEY,
        'Origin':'^'
      },

      body: JSON.stringify({ 
        address:address
        })
  };

  fetch(gasURL, requestOptions)
  .then( async response=>{
    if(response.status === 200){
    const hydroFee = await response.json();
    console.log(response)
    console.log('fee',hydroFee)
    console.log('fee',hydroFee.amount)
    console.log('fee',JSON.stringify(hydroFee))
    }
   else{
  console.log('error, please wait a couple minutes,or save your transaction hash & contact hydro admins',)
 // setTimeout(()=>this.api(values),10000);

 }
  })

  }

  api(values){
    
    //let address = values.returnValues.depositor
    //let amount = values.returnValues.outputAmount
    let hash = values.transactionHash
 
    
    const requestOptions = {
      method:'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': process.env.REACT_APP_API_KEY,
        'Origin':'^'
      },

      body: JSON.stringify({ 
        hash:hash
        })
  };

  if(this.state.prev_hash === 1){
  fetch(this.state.API_LINK, requestOptions)
        .then( async response=>{
          if(response.status === 200){
          const tx_hash = await response.json();
          this.setState({txHash:JSON.parse(tx_hash.receipt)},()=>console.log())
          toast(<a href={this.state.tx_Link + this.state.txHash.transactionHash} target="blank">Swap Success!</a>);
          this.setState({loading_text:'Success, Your Hydro is on the way.',swapping:false,prev_hash:0})
          console.log(response)
          }
         else{
        console.log('error, please wait a couple minutes,or save your transaction hash & contact hydro admins',)
        setTimeout(()=>this.api(values),10000);

       }
        })
      
    }
  }



  async load_Hydro_Bsc(web3){
    
    const currrentNetwork = await this.state.web3.eth.net.getNetworkType();
    const blockNumber = await this.state.web3.eth.getBlockNumber();
    this.setState({
      text:'BEP-20 to ERC-20',
      API_LINK:'https://hydro-bridge.org/api/send_eth/',
      tx_Link:'https://etherscan.io/tx/',
      loading: false
    })

    const accounts = await this.state.web3.eth.getAccounts();
    const account = accounts[0]
    this.setState({
      account
    })

    const hydroAddress = "0xf3DBB49999B25c9D6641a9423C7ad84168D00071" ;
    this.setState({
      hydroAddress
    })

    const hydroInstance = new web3.eth.Contract(BepHydro, hydroAddress );
    this.setState({
      hydroInstance
    })

    this.state.hydroInstance.events.allEvents({filter:{owner:this.state.account},fromBlock:'latest', toBlock:'latest'})
        .on('data',(log)=>{
          this.displayApprovedFund();
        })

    const swapContract = "0x7f00F1B8825064B109Dcc85aAd1f074652D97AAd";
    const swapInstance = new web3.eth.Contract(BscToEthAbi, swapContract);

      this.setState({
        swapAddress:swapContract,
        swapInstance
      })

      const totalSwapped = await this.state.swapInstance.methods.totalAmountSwapped().call();
      this.setState({totalSwapped:this.state.web3.utils.fromWei(totalSwapped.toString())})
  
      this.state.swapInstance.events.allEvents({toBlock:'latest'})
          .on('data',async(log)=>{
            const newTotalSwapped = await this.state.swapInstance.methods.totalAmountSwapped().call();
            this.setState({totalSwapped:this.state.web3.utils.fromWei(newTotalSwapped.toString())})
          })

    
    this.displayApprovedFund();
    this.getGasPrice();

  }

  
  async load_Hydro_Eth(web3){
    
    const currrentNetwork = await this.state.web3.eth.net.getNetworkType();
    const blockNumber = await this.state.web3.eth.getBlockNumber();
    this.setState({
      text:'ERC-20 to BEP-20',
      API_LINK:'https://hydro-bridge.org/api/send_bsc/',
      tx_Link:'https://bscscan.com/tx/',
      loading: false
    })

    const accounts = await this.state.web3.eth.getAccounts();
    const account = accounts[0]
    this.setState({
      account
    })

    const hydroAddress = "0x946112efaB61C3636CBD52DE2E1392D7A75A6f01" ;
    this.setState({
      hydroAddress
    })

    const hydroInstance = new web3.eth.Contract(HydroAbi, hydroAddress );
    this.setState({
      hydroInstance
    })

    this.state.hydroInstance.events.allEvents({filter:{owner:this.state.account}, toBlock:'latest'})
        .on('data',(log)=>{
          this.displayApprovedFund();
        })

    const swapContract = "0xfa41d158Ea48265443799CF720a120BFE77e41ca";
    const swapInstance = new web3.eth.Contract(EthToBscAbi, swapContract);
    
      this.setState({
        swapAddress:swapContract,
        swapInstance
      })

    const totalSwapped = await this.state.swapInstance.methods.totalAmountSwapped().call();
    this.setState({totalSwapped:this.state.web3.utils.fromWei(totalSwapped.toString())})

    this.state.swapInstance.events.allEvents({toBlock:'latest'})
        .on('data',async(log)=>{
          const newTotalSwapped = await this.state.swapInstance.methods.totalAmountSwapped().call();
          this.setState({totalSwapped:this.state.web3.utils.fromWei(newTotalSwapped.toString())})
        })

   
    this.displayApprovedFund();
    this.getGasPrice();

  }

//for erc hydro
  displayApprovedFund= async ()=> {
   const res = await this.state.hydroInstance.methods.balanceOf(this.state.account).call();
   const hydroBalance = this.state.web3.utils.fromWei(res.toString(), 'ether');

   const allowed_swap = await this.state.hydroInstance.methods.allowed(this.state.account, this.state.swapAddress).call();
   this.setState({allowed:this.state.web3.utils.fromWei(allowed_swap.toString(), 'ether')});

   this.setState({hydroBalance})
   
  }



  approveFunds = async ()=> {
   this.setState({loading_text:''})
   await this.state.hydroInstance.methods.approve(this.state.swapAddress, this.state.web3.utils.toWei('1000000000')).send({
      from: this.state.account,   
      })
  }

  swapHydro = async(amount)=> {
    this.setState({loading_text:'Please do not close the browser until you see the successful message.',swapping:true})
    await this.state.swapInstance.methods.swap(this.state.web3.utils.toWei(amount.toString())).send({
      from: this.state.account
    })

    .on('confirmation',(confirmationNumber, receipt)=>{
      if(confirmationNumber === 0){
      this.setState({loading_text:'Swap in progress....Please do not close the browser until you see the successful message.'},()=>console.log())
      }
      if(confirmationNumber === 2){
     // console.log('dsd',confirmationNumber,receipt.events.SwapDeposit)
      this.setState({prev_hash:1},()=>this.api(receipt.events.SwapDeposit))
      }
      
  })

  .on('error',(error, receipt)=>{ // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    this.setState({loading_text:'Transaction error.',
      swapping:false},()=>console.log())
    });
  }



  addBep = async(address, amount)=> {
    console.log(amount)
    let bep_address = '0x662D7C30F16a30214f20257bbDd8b3997Ec0204d';
    await this.state.bepHydroInstance.methods.approve(bep_address, this.state.web3.utils.toWei(amount.toString())).send({
      from: this.state.account
    })

  }


  bscToEthSwap = async(amount)=> {
    console.log(amount)
    await this.state.BscToEthInstance.methods.swap(this.state.web3.utils.toWei(amount.toString())).send({
      from: this.state.account
    })
    

  }

  

  
  render() {
    let content
    if(this.state.loading) {
      if(this.state.networkID === 97 || this.state.networkID === 4){
      content = <p id="loader" className="text-center">Loading...</p>
      }
      else
      content = <p id="network" className="text-center">{this.state.wrongNetwork}</p>
    } else {
      content = <Main
      allowed = {this.state.allowed}
      eth_allowed = {this.state.eth_allowed}
      text = {this.state.text}
      allowedHydro={this.state.hydroBalance}
      bepBalance = {this.state.bepBalance}
      swapAddress = {this.state.swapAddress}
      swapping = {this.state.swapping}
      totalSwapped = {this.state.totalSwapped}

      approveFunds={this.approveFunds}
      swapHydro={this.swapHydro}
      bscToEthSwap={this.bscToEthSwap}
      getCurrentForm={this.getCurrentForm}
      addBep={this.addBep}
      loading_text={this.state.loading_text}/>
      
    }

    return (
      <div>
        <Navbar account={this.state.account} networkId={this.state.networkID}/>
        
        <div className="container-fluid mt-5">
          <div className="row mt-5">
            <main role="main" className="col-lg-12 ml-auto mr-auto ">
              <div className="content mr-auto ml-auto">
              {content}
              <ToastContainer
              position="bottom-left"
              autoClose={25000}
              hideProgressBar={false}
              newestOnTop={false}
              rtl={false}
              pauseOnVisibilityChange
              draggable
              pauseOnHover />
              </div>
            </main>
          </div>
        </div>
        <div className="appfooter">
          <h5>BEP-20 Token: 0xf3DBB49999B25c9D6641a9423C7ad84168D00071</h5>
          <h5>ERC-20 Token: 0x946112efaB61C3636CBD52DE2E1392D7A75A6f01</h5>
        </div>
      </div>
    );
  }
}

export default App;
