import express, { Request, Response } from "express";
// import bodyParser from "body-parser";
import Web3 from "web3";
import { config } from "dotenv";
import { AbiItem, TransactionConfig } from "./types/global.batch";

config();

const app = express();

const ALCHEMY_URL_GOERLI =
  "https://eth-goerli.g.alchemy.com/v2/5dpb99DAEbRDp7oARKv78cXth7hrfOcp";
const web3 = new Web3(new Web3.providers.HttpProvider(ALCHEMY_URL_GOERLI));
const PORT = process.env.PORT || 8000;
const YOUR_API_KEY = "2999";


app.post("/transfer-items-bulk", async (req: Request, res: Response) => {
  // Check API key
  try {
    if (!req.headers["api-key"] || req.headers["api-key"] !== YOUR_API_KEY) {
      return res.status(401).send("Unauthorized");
    }

    // Validate the input parameters
    const addresses = req.body?.addresses || [];
    const items = req.body?.items || [];
    const quantities = req.body?.quantities || [];

    if (
      !Array.isArray(addresses) ||
      !Array.isArray(items) ||
      !Array.isArray(quantities)
    ) {
      return res
        .status(400)
        .status(401)
        .send("Bad Request: Invalid Parameters");
    }
    if (
      addresses.length !== items.length ||
      addresses.length !== quantities.length
    ) {
      return res
        .status(400)
        .status(401)
        .send("Bad Request: Arrays must have the same length");
    }

    // Load ERC20 Contract
    const ERC20ABI: AbiItem[] = [
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_spender",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
          {
            name: "_spender",
            type: "address",
          },
        ],
        name: "allowance",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
      },
    ];
    // YOUR "<ERC20_CONTRACT_ADDRESS>";
    const ERC20ContractAddress = process.env.CONTRACT_ADDRESS;

    const ERC20Contract = new web3.eth.Contract(ERC20ABI, ERC20ContractAddress);

  

    const YOUR_ETHEREUM_ACCOUNT_ADDRESS =
      "0xA071F1BC494507aeF4bc5038B8922641c320d486";
    const PrivateKey = "";
    let nonce = await web3.eth.getTransactionCount(
      YOUR_ETHEREUM_ACCOUNT_ADDRESS
    );

    const gasPrice = await web3.eth.getGasPrice();

    console.log(gasPrice);

    const receipts: any = [];

    for (let i = 0; i < addresses.length; i++) {
      const transferData = ERC20Contract.methods
        .transfer(addresses[i], quantities[i])
        .encodeABI();

      // raw Transaction
      const rawTransaction: TransactionConfig = {
        from: YOUR_ETHEREUM_ACCOUNT_ADDRESS as string,
        to: addresses[i],
        data: transferData,
        nonce: nonce++,
      };
      const signedTx = await web3.eth.accounts.signTransaction(
        rawTransaction,
        PrivateKey
      );

      // await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string);
      const receipt = await web3.eth.sendTransaction(signedTx.rawTransaction);
      return receipts;
    }

    res.status(201).json(receipts);
  } catch (error: any) {
    res.status(500).send({ error: error instanceof Error && error.message });
  }
  //   return
});

app.listen(PORT, () => {
  console.log(`Bulk transfer endpoint listening at port ${PORT}`);
});

