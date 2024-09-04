// const express = require("express");
// const app = express();

// app.get("/", (req, res) => res.send("Express on Vercel"));

// app.listen(3000, () => console.log("Server ready on port 3000."));

// module.exports = app;



const express = require('express');
const { ethers } = require('ethers');
const schedule = require('node-schedule');
const abi = require('./abi.json');

const app = express();
app.use(express.json());

let taskCounter = 0;
const tasks = {};

// Replace with your contract ABI and address
const contractAddress = '0x3CFEA44C62484543705223F8F63d9Cb891658E63';

// Replace with your provider and wallet details
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/439f92e674e24e8bbf14a786406bbf11'); // Use the appropriate RPC URL
const wallet = new ethers.Wallet('afdcc47bc2c0a61d98eb54756136d989a162fea6090e305eacc8791ad6d46bed', provider); // Replace with your private key
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Route to create a task
app.post('/create-task', (req, res) => {
    const { epochTime } = req.body;

    taskCounter++;
    const taskNumber = taskCounter;
    tasks[taskNumber] = epochTime;

    // Schedule the task
    const date = new Date(epochTime * 1000);
    schedule.scheduleJob(date, async () => {
        await executeTask(taskNumber);
    });

    res.json({ taskNumber });
});

async function executeTask(taskNumber) {
    console.log(`Executing task number: ${taskNumber}`);
    try {
        // Call the getWorkerDetails function and store the result
        const workerDetails = await contract.getWorkerDetails("0x12fB731120382f58CF31df4ce832628e7d6fBDf4");

        // Log the returned details from the smart contract
        console.log(`Task ${taskNumber} completed successfully.`);
        console.log(`Worker Details:`, workerDetails);
    } catch (error) {
        console.error(`Failed to execute task ${taskNumber}:`, error);
    }
}
// Route to manually execute a task (if needed)
app.post('/execute-task', async (req, res) => {
    const { taskNumber } = req.body;

    if (!tasks[taskNumber]) {
        return res.status(404).json({ error: 'Task not found' });
    }

    await executeTask(taskNumber);
    res.json({ status: 'Task executed' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});