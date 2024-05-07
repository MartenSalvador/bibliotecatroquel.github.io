document.addEventListener("DOMContentLoaded", function() {
    const buscarTroquelBtn = document.getElementById("buscarTroquel");
    const agregarTroquelBtn = document.getElementById("agregarTroquel");
    const searchSection = document.getElementById("searchSection");
    const addSection = document.getElementById("addSection");
    const deleteSection = document.getElementById("deleteSection");
    const searchInput = document.getElementById("searchInput");
    const searchResult = document.getElementById("searchResult");

    buscarTroquelBtn.addEventListener("click", function() {
        hideAllSections();
        searchSection.style.display = "block";
    });

    agregarTroquelBtn.addEventListener("click", function() {
        hideAllSections();
        addSection.style.display = "block";
        // Mostrar los campos de medidas adecuados al tipo seleccionado al hacer clic en "Agregar Troquel"
        const tipoSeleccionado = document.getElementById("tipoTroquel").value;
        if (tipoSeleccionado === "rectangular") {
            document.getElementById("rectangularFields").style.display = "block";
            document.getElementById("trapecialFields").style.display = "none";
        } else if (tipoSeleccionado === "trapecial") {
            document.getElementById("rectangularFields").style.display = "none";
            document.getElementById("trapecialFields").style.display = "block";
        }
    });

    document.getElementById("searchButton").addEventListener("click", function() {
        const medida = searchInput.value;
        let resultados;
        if (medida === "Todos") {
            resultados = obtenerTodosTroqueles();
        } else {
            resultados = buscarTroquelPorMedidaExacta(medida);
        }
        mostrarResultados(resultados);

        // Mostrar troqueles dentro del rango de +/- 10mm
        mostrarTroquelesRango(medida);
    });

    function obtenerTodosTroqueles() {
        let troqueles = JSON.parse(localStorage.getItem("troqueles")) || [];
        return troqueles;
    }

    document.getElementById("tipoTroquel").addEventListener("change", function() {
        const tipoSeleccionado = document.getElementById("tipoTroquel").value;
        if (tipoSeleccionado === "rectangular") {
            document.getElementById("rectangularFields").style.display = "block";
            document.getElementById("trapecialFields").style.display = "none";
        } else if (tipoSeleccionado === "trapecial") {
            document.getElementById("rectangularFields").style.display = "none";
            document.getElementById("trapecialFields").style.display = "block";
        }
    });

    document.getElementById("guardarTroquel").addEventListener("click", function() {
        const tipoSeleccionado = document.getElementById("tipoTroquel").value;
        const usoTroquel = document.getElementById("troquelUso").value;
        const ubicacionTroquel = document.getElementById("troquelGuardado").value;
        let medidasTroquel;
        let formaTroquel;
        if (tipoSeleccionado === "rectangular") {
            const baseRectangular = document.getElementById("baseRectangular").value;
            const alturaRectangular = document.getElementById("alturaRectangular").value;
            medidasTroquel = `${baseRectangular}mm x ${alturaRectangular}mm`;
            formaTroquel = "rectangular"; // Agregamos la forma del troquel aquí
        } else if (tipoSeleccionado === "trapecial") {
            const baseMayorTrapecial = document.getElementById("baseMayorTrapecial").value;
            const baseMenorTrapecial = document.getElementById("baseMenorTrapecial").value;
            const alturaTrapecial = document.getElementById("alturaTrapecial").value;
            medidasTroquel = `${baseMayorTrapecial}mm x ${baseMenorTrapecial}mm x ${alturaTrapecial}mm (Altura: ${alturaTrapecial}mm)`; // Agregamos la altura
            formaTroquel = "trapecial"; // Agregamos la forma del troquel aquí
        }
        guardarTroquel(medidasTroquel, usoTroquel, ubicacionTroquel, formaTroquel); // Pasamos la forma del troquel como argumento
    });

    function buscarTroquelPorMedidaExacta(medida) {
        let troqueles = JSON.parse(localStorage.getItem("troqueles")) || [];
        const resultados = troqueles.filter(troquel => {
            if (troquel.medidas) {
                const medidasTroquel = troquel.medidas.split(" ");
                return medidasTroquel.includes(medida);
            }
            return false;
        });
        return resultados;
    }

    function buscarTroquelPorMedidaEnRango(medida) {
        let troqueles = JSON.parse(localStorage.getItem("troqueles")) || [];
        const medidaNumerica = parseFloat(medida);
        const resultados = troqueles.filter(troquel => {
            if (troquel.medidas) {
                const medidasTroquel = troquel.medidas.split(" ").map(medida => parseFloat(medida));
                return medidasTroquel.some(medidaTroquel => medidaTroquel >= medidaNumerica - 10 && medidaTroquel <= medidaNumerica + 10 && medidaTroquel !== medidaNumerica);
            }
            return false;
        });
        return resultados;
    }

    function mostrarTroquelesRango(medida) {
        const resultadosRango = buscarTroquelPorMedidaEnRango(medida);
        if (resultadosRango.length > 0) {
            const rangoDiv = document.createElement("div");
            rangoDiv.innerHTML = "<h2>Troqueles dentro del rango de +/- 10mm</h2>";
            resultadosRango.forEach(troquel => {
                const troquelInfo = document.createElement("div");
                troquelInfo.classList.add("troquel-info");
                const forma = troquel.forma || "Desconocida";
                const medidas = troquel.medidas || "Desconocidas";
                let medidasMostradas = medidas;
                if (troquel.forma === "trapecial") { // Si es un troquel trapecial, mostramos también la altura
                    const alturaTroquel = medidas.split(" ")[2]; // Suponiendo que la altura siempre es la tercera medida
                    medidasMostradas += ` (Altura: ${alturaTroquel}mm)`;
                }
                troquelInfo.innerHTML = `<p><strong>Troquel</strong></p>
                                         <p>Forma: ${forma}</p>
                                         <p>Medidas: ${medidasMostradas}</p>
                                         <p>Uso: ${troquel.uso}</p>
                                         <p>Guardado en: ${troquel.guardado}</p>`;
                const eliminarBtn = document.createElement("button");
                eliminarBtn.textContent = "Eliminar";
                eliminarBtn.addEventListener("click", function() {
                    eliminarTroquel(troquel); // Pasamos el objeto troquel en lugar del índice
                });
                troquelInfo.appendChild(eliminarBtn);
                rangoDiv.appendChild(troquelInfo); // Agregamos el troquel al contenedor del rango
            });
            searchResult.appendChild(rangoDiv);
        }
    }

    function guardarTroquel(medidas, uso, ubicacion, forma) {
        console.log("Forma del troquel:", forma); // Agregamos un mensaje de consola para depurar
        let troqueles = JSON.parse(localStorage.getItem("troqueles")) || [];
        troqueles.push({ medidas: medidas, uso: uso, guardado: ubicacion, forma: forma });
        localStorage.setItem("troqueles", JSON.stringify(troqueles));
        alert("Troquel guardado correctamente.");
    }

    function mostrarResultados(resultados) {
        searchResult.innerHTML = "";
        if (resultados.length === 0) {
            searchResult.innerHTML = "No se encontraron troqueles con esa medida.";
        } else {
            resultados.forEach((troquel, index) => {
                const troquelInfo = document.createElement("div");
                troquelInfo.classList.add("troquel-info");
                const forma = troquel.forma || "Desconocida";
                const medidas = troquel.medidas || "Desconocidas";
                let medidasMostradas = medidas;
                if (troquel.forma === "trapecial") { // Si es un troquel trapecial, mostramos también la altura
                    const medidasArray = medidas.split(" ");
                    const alturaTroquel = medidasArray[2]; // La altura debería ser el tercer elemento en la cadena
                    medidasMostradas += ` (Altura: ${alturaTroquel}mm)`;
                }
                troquelInfo.innerHTML = `<p><strong>Troquel ${index + 1}</strong></p>
                                         <p>Forma: ${forma}</p>
                                         <p>Medidas: ${medidasMostradas}</p>
                                         <p>Uso: ${troquel.uso}</p>
                                         <p>Guardado en: ${troquel.guardado}</p>`;
                const eliminarBtn = document.createElement("button");
                eliminarBtn.textContent = "Eliminar";
                eliminarBtn.addEventListener("click", function() {
                    eliminarTroquel(troquel);
                });
                troquelInfo.appendChild(eliminarBtn);
                searchResult.appendChild(troquelInfo);
            });
        }
    }
    

    function eliminarTroquel(troquel) {
        let troqueles = JSON.parse(localStorage.getItem("troqueles")) || [];
        // Buscamos el índice del troquel a eliminar
        const index = troqueles.findIndex(item => item.medidas === troquel.medidas && item.uso === troquel.uso && item.guardado === troquel.guardado && item.forma === troquel.forma);
        if (index !== -1) {
            troqueles.splice(index, 1);
            localStorage.setItem("troqueles", JSON.stringify(troqueles));
            const medidaActual = searchInput.value; // Obtener la medida actual de la búsqueda
            const resultadosActualizados = buscarTroquelPorMedidaExacta(medidaActual); // Buscar troqueles con la medida actual
            mostrarResultados(resultadosActualizados); // Mostrar los resultados actualizados
            alert("Troquel eliminado correctamente.");
        } else {
            alert("No se pudo encontrar el troquel a eliminar.");
        }
    }

    function hideAllSections() {
        searchSection.style.display = "none";
        addSection.style.display = "none";
    }
});
