// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC7857DataVerifier.sol";

contract SimpleVerifier is IERC7857DataVerifier {
    function verifyTransferValidity(
        TransferValidityProof[] calldata
    ) external pure override returns (TransferValidityProofOutput[] memory) {
        return new TransferValidityProofOutput[](0);
    }
}