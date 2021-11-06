const express = require("express");
const router = express.Router();

const lobbyService = require("../services/lobby");

router.post("/create", lobbyService.postCreateLobby);
router.post("/get", lobbyService.getLobby);
router.post("/join", lobbyService.joinLobby);
router.post("/leave", lobbyService.leaveLobby);
router.post("/status", lobbyService.getStatus);
router.post("/answer", lobbyService.postAnswer);
router.post("/lie", lobbyService.postStatement);
router.post("/start", lobbyService.startGame);

module.exports = router;
