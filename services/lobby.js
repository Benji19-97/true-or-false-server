const express = require("express");

const GameState = {
      LobbyPhase: 1,
      RoundStartPhase: 2,
      PlayPhase: 3,
      RevealPhase: 4,
      EndPhase: 5,
};

var Player = class {
      constructor(name, lobby, isOwner) {
            this.name = name;
            this.id = getRandomPlayerId(lobby);
            this.isOwner = isOwner;
            this.score = 0;
            this.givenAnswer = false;
      }

      get privateJson() {
            return {
                  name: this.name,
                  id: this.id,
            };
      }

      get publicJson() {
            return {
                  name: this.name,
                  score: this.score,
                  givenAnswer: this.givenAnswer,
            };
      }
};

var GameStatus = class {
      constructor(
            lobbyId,
            lobbyOwnerName,
            players,
            gameState,
            chosenPlayerName,
            roundIndex,
            isChosen,
            originalStatement,
            trueOrFalse,
            playerGivenStatement,
            phaseDuration
      ) {
            this.lobbyId = lobbyId;
            this.lobbyOwnerName = lobbyOwnerName;
            this.players = players;
            this.gameState = gameState;
            this.chosenPlayerName = chosenPlayerName;
            this.roundIndex = roundIndex;
            this.isChosen = isChosen;
            this.originalStatement = originalStatement;
            this.trueOrFalse = trueOrFalse;
            this.playerGivenStatement = playerGivenStatement;
            this.phaseDuration = phaseDuration;
      }
};

var Lobby = class {
      constructor() {
            this.id = getRandomLobbyId();
            this.state = GameState.LobbyPhase;
            this.players = [];
            this.status = "open";
            this.roundIndex = 0;
            this.phaseDuration = 0;
      }

      get json() {
            return new GameStatus(
                  this.id,
                  this.owner.name,
                  this.playerList,
                  this.state,
                  this.chosenPlayer != undefined ? this.chosenPlayer.name : "",
                  this.roundIndex,
                  false,
                  "",
                  false,
                  "",
                  this.phaseDuration
            );
      }

      get playerList() {
            var players = [];

            this.players.forEach((player) => {
                  players.push(player.publicJson);
            });

            return players;
      }

      getStatus(player) {
            let status = this.json;

            if (this.state === GameState.LobbyPhase) {
                  return status;
            }

            if (this.state === GameState.RoundStartPhase) {
                  if (player == this.chosenPlayer) {
                        status.isChosen = true;
                        status.originalStatement = this.originalStatement;
                        status.trueOrFalse = this.trueOrFalse;
                  }

                  return status;
            }

            if (this.state === GameState.PlayPhase) {
                  status.originalStatement = this.originalStatement;
                  status.playerGivenStatement = this.playerGivenStatement;

                  if (player == this.chosenPlayer) {
                        status.isChosen = true;
                        status.trueOrFalse = this.trueOrFalse;
                  }

                  return status;
            }

            if (this.state === GameState.RevealPhase) {
                  status.originalStatement = this.originalStatement;
                  status.playerGivenStatement = this.playerGivenStatement;
                  status.trueOrFalse = this.trueOrFalse;
                  return status;
            }

            if (this.state === GameState.EndPhase) {
                  return status;
            }

            return undefined;
      }

      startNewRound() {
            if (this.state != GameState.LobbyPhase && this.state != GameState.EndPhase) return;

            this.state = GameState.RoundStartPhase;
            this.roundIndex += 1;
            this.status = "closed";
            this.chosenPlayer = this.players[Math.floor(Math.random() * this.players.length)];
            this.originalStatement = "Hamsters can swim by default."; //TODO: Import questions here
            this.trueOrFalse = false; //TODO: Impot answer here
            this.phaseDuration = 10;
            this.playerGivenStatement = "";

            const currentRoundIdx = this.roundIndex;

            this.players.forEach((player) => {
                  player.givenAnswer = false;
            });

            setTimeout(() => {
                  if (this.state == GameState.RoundStartPhase && this.roundIndex == currentRoundIdx) {
                        this.enterPlayPhase();
                  }
            }, 10000);
      }

      enterPlayPhase() {
            if (this.state != GameState.RoundStartPhase) return;

            this.state = GameState.PlayPhase;
            this.phaseDuration = 10;

            const currentRoundIdx = this.roundIndex;

            setTimeout(() => {
                  if (this.state == GameState.PlayPhase && this.roundIndex == currentRoundIdx) {
                        this.revealResults();
                  }
            }, 10000);
      }

      revealResults() {
            if (this.state != GameState.PlayPhase) return;

            this.state = GameState.RevealPhase;
            this.phaseDuration = 10;

            let wrongAnswerCount = 0;

            this.players.forEach((player) => {
                  if (player != this.chosenPlayer) {
                        let playerAnswer = player.givenAnswer;
                        if (playerAnswer === this.trueOrFalse) {
                              player.score += 1;
                        } else {
                              wrongAnswerCount += 1;
                        }

                        this.chosenPlayer.score += wrongAnswerCount;
                  }
            });

            setTimeout(() => {
                  this.endGame();
            }, 10000);
      }

      endGame() {
            if (this.state != GameState.RevealPhase) return;
            this.state = GameState.EndPhase;
            this.phaseDuration = 10;

            setTimeout(() => {
                  if (this.roundIndex >= 10) {
                        this.roundIndex = 0;
                        this.status == "open";

                        this.players.forEach((player) => {
                              player.score = 0;
                        });

                        this.chosenPlayer = undefined;
                        this.state = GameState.LobbyPhase;
                  } else {
                        this.startNewRound();
                  }
            }, 10000);
      }

      registerPlayer(player) {
            if (this.status == "open") {
                  this.players.push(player);
                  return true;
            }

            return false;
      }

      deregisterPlayer(playerId) {
            let sizeBefore = this.players.length;

            const player = this.players.find((p) => p.id === playerId);

            if (player == undefined) {
                  return false;
            }

            const playerWasOwner = player.isOwner;

            this.players = this.players.filter((p) => p.id !== playerId);
            let sizeAfter = this.players.length;

            if (playerWasOwner) {
                  if (sizeAfter > 0) {
                        this.owner = this.players[0];
                        this.players[0].isOwner = true;
                  } else {
                        console.log("removed lobby: " + this.id);
                        lobbies = lobbies.filter((lob) => lob.id !== this.id);
                  }
            }

            return sizeBefore > sizeAfter;
      }

      registerOwner(player) {
            this.owner = player;
      }

      update() {}
};

var lobbies = [];

var INTERVAL = 500;

setInterval(() => {}, INTERVAL);

module.exports = {
      postCreateLobby: (req, res) => {
            const userName = req.body["name"];
            const lobby = new Lobby(userName);
            lobbies.push(lobby);

            const ownerPlayer = new Player(userName, lobby, true);
            lobby.registerPlayer(ownerPlayer);
            lobby.registerOwner(ownerPlayer);

            return res.status(200).json({ lobbyId: lobby.id, userId: ownerPlayer.id });
      },
      getLobby: (req, res) => {
            return res.status(200).json(lobbies);
      },
      joinLobby: (req, res) => {
            const lobbyId = req.body["lobbyId"];

            const lobby = lobbies.find((lobby) => lobby.id === lobbyId);

            if (lobby == undefined) {
                  return res.status(404).json({ couldntFindLobby: lobbyId });
            }

            const userName = req.body["name"];

            const player = new Player(userName, lobby, false);
            const success = lobby.registerPlayer(player);
            if (success) {
                  return res.status(200).json(player.privateJson);
            } else {
                  return res.status(403).json({ lobbyStatus: "closed" });
            }
      },
      leaveLobby: (req, res) => {
            const lobbyId = req.body["lobbyId"];
            const lobby = lobbies.find((lobby) => lobby.id === lobbyId);

            if (lobby == undefined) {
                  return res.status(404).json({ couldntFindLobby: lobbyId });
            }

            const playerId = req.body["playerId"];
            const success = lobby.deregisterPlayer(playerId);

            if (success) {
                  return res.status(200).json({ leftLobby: lobbyId });
            } else {
                  return res.status(404).json({ couldntFindPlayer: playerId });
            }
      },
      getStatus: (req, res) => {
            const playerId = req.body["playerId"];
            const lobbyId = req.body["lobbyId"];
            const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
            if (lobby == undefined) {
                  return res.status(404).json({ couldntFindLobby: lobbyId });
            }

            const player = lobby.players.find((player) => player.id == playerId);
            if (player == undefined) {
                  return res.status(404).json({ couldntFindPlayer: playerId });
            }

            const status = lobby.getStatus(player);
            if (status == undefined) {
                  return res.status(404).send("Not found :(");
            }

            return res.status(200).json(status);
      },
      postAnswer: (req, res) => {
            const playerId = req.body["playerId"];
            const lobbyId = req.body["lobbyId"];
            const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
            if (lobby == undefined) {
                  return res.status(404).json({ couldntFindLobby: lobbyId });
            }

            if (lobby.state != GameState.PlayPhase) {
                  return res.status(200).send("error: wrong lobby phase");
            }

            const player = lobby.players.find((player) => player.id == playerId);
            if (player == undefined) {
                  return res.status(404).json({ couldntFindPlayer: playerId });
            }

            const answer = req.body["answer"];
            console.log("received answer from " + player.name + ": " + answer);
            player.givenAnswer = answer;

            return res.status(200).send("ok");
      },
      postStatement: (req, res) => {
            const playerId = req.body["playerId"];
            const lobbyId = req.body["lobbyId"];
            const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
            if (lobby == undefined) {
                  return res.status(404).json({ couldntFindLobby: lobbyId });
            }

            if (lobby.state != GameState.RoundStartPhase) {
                  return res.status(403).send("wrong lobby phase");
            }

            const player = lobby.players.find((player) => player.id == playerId);
            if (player == undefined) {
                  return res.status(404).json({ couldntFindPlayer: playerId });
            }

            if (player != lobby.chosenPlayer) {
                  return res.status(403).send("you are not chosen ;)");
            }

            const statement = req.body["statement"];
            console.log("received statement: " + statement);
            lobby.playerGivenStatement = statement;

            return res.status(200).send("ok");
      },
      startGame: (req, res) => {
            const playerId = req.body["playerId"];
            const lobbyId = req.body["lobbyId"];
            const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
            if (lobby == undefined) {
                  return res.status(404).json({ couldntFindLobby: lobbyId });
            }

            if (lobby.state != GameState.LobbyPhase) {
                  return res.status(403).send("wrong game phase");
            }

            const player = lobby.players.find((player) => player.id == playerId);
            if (player == undefined) {
                  return res.status(404).json({ couldntFindPlayer: playerId });
            }

            if (player != lobby.owner) {
                  return res.status(403).send("you are not the owner, you cannot start the game but nice try!");
            }

            lobby.startNewRound();
            console.log("received start command");
            return res.status(200).send("game started");
      },
};

function getRandomLobbyId() {
      let id = getRandomString(4);
      while (lobbies.some((lobby) => lobby.id === id)) {
            id = getRandomString(4);
      }
      return id;
}

function getRandomPlayerId(lobby) {
      let id = getRandomString(8);
      while (lobby.players.some((player) => player.id === id)) {
            id = getRandomString(8);
      }
      return id;
}

function getRandomString(length) {
      var result = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
}
