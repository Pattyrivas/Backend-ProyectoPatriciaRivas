export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Error inesperado en el servidor",
      detalle: err.message,
    });
  };
  