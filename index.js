const MerkleTree = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')
var xlsx = require('excel4node');
var tx = require('./txController')
var fs = require('fs');

function computeMerkleRoot(jsonData, proofDest) {
    var workbook = new xlsx.Workbook();
    var ws = workbook.addWorksheet('ProofData');

    const dataHash = jsonData.map(x => SHA256(JSON.stringify(x)))

    const tree = new MerkleTree(dataHash, SHA256)
    const root = tree.getRoot().toString('hex')

    for(var i = 0; i < jsonData.length; i++) {
        var item = jsonData[i]
        var itemStr = JSON.stringify(item)
        var leaf = SHA256(itemStr)

        // Store this following proof in DB as string
        var proof = JSON.stringify(tree.getProof(leaf))

        ws.cell(i + 1, 1).string(itemStr)
        ws.cell(i+ 1, 2).string(proof)
        console.log(proof)
    }

    workbook.write(proofDest)

    return root
}

function publishOnBlockchain(root, size) {
    tx.makeTransaction(root, false)
}

var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// const dataHash = data.map(x => SHA256(JSON.stringify(x)))

// const tree = new MerkleTree(dataHash, SHA256)
// const root = tree.getRoot().toString('hex')

// var wb = new xl.Workbook();

// for(var key in data) {
//     var item = data[key]
//     var leaf = SHA256(JSON.stringify(item))

//     // Store this following proof in DB as string
//     var proof = JSON.stringify(tree.getProof(leaf))

//     // Following line should be replaced by the code that
//     // fetches proof from DB and then converts it to json array
//     proofJson = JSON.parse(proof)

//     // Converting fetched proof to appropriate format
//     for(var key in proofJson) {
//         proofJson[key].data = Buffer.from(proofJson[key].data)
//     }

//     console.log(tree.verify(proofJson, leaf, root)) // true
// }

console.log("Computing Merkle Root...")
const root = computeMerkleRoot(data, "Data.xlsx")

console.log("Publishing root on Blockchain")
const txid = publishOnBlockchain(root, data.length)