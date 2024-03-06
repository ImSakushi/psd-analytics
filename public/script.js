document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        const prettyPrintedHTML = prettyPrintJSON(data);
        document.getElementById('psdInfo').innerHTML = prettyPrintedHTML;
    })
    .catch(error => console.error('Erreur:', error));
});

function prettyPrintJSON(data) {
    const infoDiv = document.createElement('div');

    // Création d'une fonction récursive pour traiter et afficher chaque élément du JSON
    function createNodeElement(node, indent = 0) {
        const nodeElement = document.createElement('div');
        nodeElement.style.marginLeft = `${indent * 20}px`;
    
        for (const [key, value] of Object.entries(node)) {
            const element = document.createElement('p');
            element.style.margin = '5px 0';
    
            if (Array.isArray(value)) {
                // Vérifie si le tableau contient des objets et nécessite un traitement spécial
                if (value.length > 0 && typeof value[0] === 'object') {
                    element.innerHTML = `<strong>${key}:</strong>`;
                    nodeElement.appendChild(element);
                    value.forEach(subNode => {
                        // Appel récursif pour chaque objet dans le tableau
                        nodeElement.appendChild(createNodeElement(subNode, indent + 1));
                    });
                } else {
                    // Pour les tableaux ne contenant pas d'objets, on joint les valeurs
                    const arrayValues = value.join(", ");
                    element.innerHTML = `<strong>${key}:</strong> ${arrayValues}`;
                    nodeElement.appendChild(element);
                }
            } else if (typeof value === 'object' && value !== null) {
                // Traitement des objets non-tableaux
                element.innerHTML = `<strong>${key}:</strong>`;
                nodeElement.appendChild(element);
                nodeElement.appendChild(createNodeElement(value, indent + 1));
            } else {
                // Traitement des valeurs primitives
                element.innerHTML = `<strong>${key}:</strong> ${value}`;
                nodeElement.appendChild(element);
            }
        }
        return nodeElement;
    }
    
    infoDiv.appendChild(createNodeElement(data));
    return infoDiv.innerHTML;
}

document.getElementById('exportPng').addEventListener('click', function() {
    // Assurez-vous que le formulaire a déjà été soumis et qu'il y a un fichier à exporter
    const formData = new FormData(document.querySelector('form'));
    if (formData.has('psdFile')) {
        fetch('/export', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) throw new Error('Échec de l\'exportation');
            return response.blob();
        })
        .then(blob => {
            // Créer un URL pour le fichier blob et le télécharger
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exported-image.png';
            document.body.appendChild(a); // Nécessaire pour Firefox
            a.click();
            a.remove();
        })
        .catch(error => console.error('Erreur:', error));
    } else {
        alert('Veuillez d\'abord télécharger un fichier PSD.');
    }
});
