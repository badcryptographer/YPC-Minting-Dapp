// SPDX-License-Identifier: MIT

pragma solidity >=0.8.4 <0.9.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract YummyPanda is ERC721A, Ownable {
  using Strings for uint256;
  
  string public baseURI;
  string public baseExtension = ".json";
  bytes32 public ogMerkleRoot = "";
  bytes32 public whitelistMerkleRoot = "";

  uint256 public constant MAX_SUPPLY = 10000;

  bool public isOGPaused = true;
  bool public isWLPaused = true;
  bool public isPresalePaused = true;
  bool public isPaused = true;

  mapping(address => bool) public ogHasMinted;
  mapping(address => bool) public wlHasMinted;
  mapping(address => uint256) public presaleMintCount;
  mapping(address => uint256) public publicMintCount;

  uint256 public ogMintPrice = 0.05 ether;
  uint256 public whitelistMintPrice = 0.05 ether;
  uint256 public presaleMintSale = 0.08 ether;
  uint256 public mintPrice = 0.1 ether;

  constructor(
    string memory _name,
    string memory _symbol
  ) ERC721A(_name, _symbol) {
  }

  // -- Amount Compliance --

  modifier ogAmountCompliance() {
    require(msg.value >= ogMintPrice, "Insufficient funds sent");
    _;
  }

  modifier whitelistAmountCompliance() {
    require(msg.value >= whitelistMintPrice, "Insufficient funds sent");
    _;
  }

  modifier presaleAmountCompliance() {
    require(msg.value >= presaleMintSale, "Insufficient funds sent");
    _;
  }

  modifier amountCompliance() {
    require(msg.value >= mintPrice, "Insufficient funds sent");
    _;
  }

  // -- Paused Compliance --

  modifier ogPausedCompliance() {
    require(!isOGPaused, "Minting is currently paused");
    _;
  }

  modifier whitelistPausedCompliance() {
    require(!isWLPaused, "Minting is currently paused");
    _;
  }

  modifier presalePausedCompliance() {
    require(!isPresalePaused, "Minting is currently paused");
    _;
  }

  modifier pausedCompliance() {
    require(!isPaused, "Minting is currently paused");
    _;
  }

  // -- Max Count Compliance --

  modifier ogNotMintedCompliance(address _address) {
    require(!ogHasMinted[_address], "Already minted");
    _;
  }

  modifier wlNotMintedCompliance(address _address) {
    require(!wlHasMinted[_address], "Already minted");
    _;
  }

  modifier presaleMintCountCompliance(address _address) {
    require(presaleMintCount[_address] <= 2, "Already minted 2");
    _;
  }

  modifier publicMintCountCompliance(address _address) {
    require(publicMintCount[_address] <= 4, "Already minted 4");
    _;
  }

  modifier supplyCompliance() {
    uint256 supply = totalSupply();
    require(supply + 1 <= MAX_SUPPLY, "Insufficient supply remaining");
    _;
  }

  // -- Whitelist --

  modifier isValidMerkleProof(bytes32[] calldata _merkleProof, bytes32 _root) {
    require(
      MerkleProof.verify(
        _merkleProof,
        _root,
        keccak256(abi.encodePacked(msg.sender))
      ),
      "Whitelist merkle proof is invalid"
    );
    _;
  }

  function reserve(uint256 _amount, address _address) public onlyOwner {
    uint256 supply = totalSupply();
    require(supply + _amount <= MAX_SUPPLY, "Insufficient supply remaining");

    _safeMint(_address, _amount);
  }

  // -- Mint --

  function ogMint(bytes32[] calldata _proof)
    public
    payable
    ogPausedCompliance
    supplyCompliance
    ogAmountCompliance
    ogNotMintedCompliance(msg.sender)
    isValidMerkleProof(_proof, ogMerkleRoot)
  {
    ogHasMinted[msg.sender] = true;
    _safeMint(msg.sender, 1);
  }

  function whitelistMint(bytes32[] calldata _proof)
    public
    payable
    whitelistPausedCompliance
    supplyCompliance
    whitelistAmountCompliance
    wlNotMintedCompliance(msg.sender)
    isValidMerkleProof(_proof, whitelistMerkleRoot)
  {
    wlHasMinted[msg.sender] = true;
    _safeMint(msg.sender, 1);
  }

  function presaleMint()
    public
    payable
    presalePausedCompliance
    supplyCompliance
    presaleAmountCompliance
    presaleMintCountCompliance(msg.sender)
  {
    presaleMintCount[msg.sender] += 1;
    _safeMint(msg.sender, 1);
  }

  function mint()
    public
    payable
    pausedCompliance
    supplyCompliance
    amountCompliance
    publicMintCountCompliance(msg.sender)
  {
    publicMintCount[msg.sender] += 1;
    _safeMint(msg.sender, 1);
  }

  // -- Misc --

  function tokenURI(uint256 _tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(_tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    string memory currentBaseURI = _baseURI();
    return
      bytes(currentBaseURI).length > 0
        ? string(
          abi.encodePacked(currentBaseURI, _tokenId.toString(), baseExtension)
        )
        : "";
  }

  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }


  // -- Root --

  function setOGMerkleRoot(bytes32 _ogMerkleRoot) public onlyOwner {
    ogMerkleRoot = _ogMerkleRoot;
  }

  function setWLMerkleRoot(bytes32 _whitelistMerkleRoot) public onlyOwner {
    whitelistMerkleRoot = _whitelistMerkleRoot;
  }

  // -- Paused --

  function setIsOGPaused(bool _isOGPaused) public onlyOwner {
    isOGPaused = _isOGPaused;
  }

  function setIsWLPaused(bool _isWLPaused) public onlyOwner {
    isWLPaused = _isWLPaused;
  }

  function setIsPresalePaused(bool _isPresalePaused) public onlyOwner {
    isPresalePaused = _isPresalePaused;
  }

  function setIsPaused(bool _isPaused) public onlyOwner {
    isPaused = _isPaused;
  }

  // -- Price --

  function setOGMintPrice(uint256 _ogMintPrice) public onlyOwner {
    ogMintPrice = _ogMintPrice;
  }

  function setWhitelistMintPrice(uint256 _whitelistMintPrice) public onlyOwner {
    whitelistMintPrice = _whitelistMintPrice;
  }

  function setPresaleMintSale(uint256 _presaleMintSale) public onlyOwner {
    presaleMintSale = _presaleMintSale;
  }

  function setMintPrice(uint256 _mintPrice) public onlyOwner {
    mintPrice = _mintPrice;
  }

  // -- Metadata --

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _baseExtension) public onlyOwner {
    baseExtension = _baseExtension;
  }

  function withdraw() public payable onlyOwner {
    (bool success, ) = payable(address(this)).call{ value: address(this).balance }("");
    require(success);
  }
}
