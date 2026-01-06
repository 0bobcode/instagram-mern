import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const ChessPage = () => {
    const [game, setGame] = useState(new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [optionSquares, setOptionSquares] = useState({});

    // 1. NPC Movement Logic
    useEffect(() => {
        if (game.turn() === "b" && !game.isGameOver()) {
            setTimeout(() => {
                const moves = game.moves();
                if (moves.length > 0) {
                    const gameCopy = new Chess(game.fen());
                    gameCopy.move(moves[Math.floor(Math.random() * moves.length)]);
                    setGame(gameCopy);
                }
            }, 600);
        }
    }, [game]);

    // 2. Function to find valid moves for a square
    function getMoveOptions(square) {
        const moves = game.moves({
            square,
            verbose: true,
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) && game.get(move.to).color !== game.get(square).color
                        ? "radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
            return move;
        });
        newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
        setOptionSquares(newSquares);
        return true;
    }

    // 3. Handle Square Clicks (Click-to-Move)
    function onSquareClick(square) {
        // If we haven't selected a piece yet
        if (!moveFrom) {
            const hasOptions = getMoveOptions(square);
            if (hasOptions) setMoveFrom(square);
            return;
        }

        // If we are clicking the target square
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
            from: moveFrom,
            to: square,
            promotion: "q",
        });

        if (move === null) {
            const hasOptions = getMoveOptions(square);
            if (hasOptions) setMoveFrom(square);
            return;
        }

        setGame(gameCopy);
        setMoveFrom("");
        setOptionSquares({});
    }

    // 4. Handle Drag-and-Drop (Still supported)
    function onPieceDrop(sourceSquare, targetSquare) {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (move === null) return false;

        setGame(gameCopy);
        setOptionSquares({});
        return true;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: "5px 0" }}>Chess vs NPC</h2>
                <div style={styles.turnIndicator}>
                    {game.turn() === "w" ? "⚪ Your Turn" : "⚫ NPC Thinking..."}
                </div>
            </div>

            <div style={styles.boardWrapper}>
                <Chessboard
                    id="ClickToMoveBoard"
                    position={game.fen()}
                    onPieceDrop={onPieceDrop}
                    onSquareClick={onSquareClick}
                    customSquareStyles={optionSquares}
                    boardOrientation="white"
                    animationDuration={200}
                />
            </div>

            <button style={styles.resetBtn} onClick={() => { setGame(new Chess()); setOptionSquares({}); }}>
                Reset Game
            </button>

            {game.isGameOver() && (
                <div style={styles.overlay}>
                    <h3>Game Over</h3>
                    <p>{game.isCheckmate() ? "Checkmate!" : "Draw"}</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        background: "#f0f2f5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
    },
    header: { textAlign: "center", marginBottom: "20px" },
    turnIndicator: { fontSize: "14px", color: "#65676b", fontWeight: "600" },
    boardWrapper: {
        width: "95vw",
        maxWidth: "450px",
        boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
        borderRadius: "8px",
        overflow: "hidden"
    },
    resetBtn: {
        marginTop: "30px",
        padding: "10px 20px",
        backgroundColor: "#0095f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "bold",
        cursor: "pointer"
    }
};

export default ChessPage;