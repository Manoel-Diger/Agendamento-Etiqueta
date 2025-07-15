// Variáveis globais
let etiquetasGeradas = [];
let contadorCodigo = 1;

// Inicializar data atual
const d = new Date();
document.getElementById('dataEntrega').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

document.getElementById('horarioEntrega').value = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

// Função para alterar quantidade
function changeQuantity(delta) {
    const quantidadeInput = document.getElementById('quantidade');
    const novaQuantidade = parseInt(quantidadeInput.value) + delta;
    if (novaQuantidade >= 1 && novaQuantidade <= 20) {
        quantidadeInput.value = novaQuantidade;
    }
}

// Função para gerar código de rastreamento
function gerarCodigoRastreamento() {
    const ano = new Date().getFullYear();
    const codigo = `AG-${ano}-${String(contadorCodigo).padStart(3, '0')}`;
    contadorCodigo++;
    return codigo;
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    const nums = telefone.replace(/\D/g, '');
    if (nums.length === 11) {
        return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
    }
    return telefone;
}

// Função para gerar etiquetas
function gerarEtiquetas(event) {
    event.preventDefault();
    
    const dataRaw = document.getElementById('dataEntrega').value;// ex: "2025-07-04"
    const partesData = dataRaw.split('-'); // yyyy-mm-dd separa ["2025", "07", "04"]
    const dataLocal = new Date(partesData[0], partesData[1] - 1, partesData[2]); // mês zero-based
    const dataFormatada = dataLocal.toLocaleDateString('pt-BR');

    const horarioRaw = document.getElementById('horarioEntrega').value; // formato 'HH:MM' 08:00
    const [hora, minuto] = horarioRaw.split(':').map(Number);// transforma em números: hora=8, minuto=0

    const dados = {
        data: dataFormatada,
        horario: horarioRaw,
        destinatario: document.getElementById('destinatario').value,
        telefone: formatarTelefone(document.getElementById('telefone').value),
        endereco: document.getElementById('endereco').value,
        produto: document.getElementById('produto').value,
        responsavel: document.getElementById('responsavel').value,
        observacoes: document.getElementById('observacoes').value,
        quantidade: parseInt(document.getElementById('quantidade').value)
    };

    // Validar se todos os campos estão preenchidos
    const camposObrigatorios = ['data', 'horario', 'destinatario', 'telefone', 'endereco', 'produto', 'responsavel'];
    const camposVazios = camposObrigatorios.filter(campo => !dados[campo]);
    
    if (camposVazios.length > 0) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    // Validar data não retroativa
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    
    if (dataLocal < hoje) {
        alert('A data de entrega não pode ser retroativa!');
        return;
    }
    
    // Se a data for hoje, validar também o horário
    if (dataLocal.getTime() === hoje.getTime()) {
        if (hora < agora.getHours() || (hora === agora.getHours() && minuto < agora.getMinutes())) {
            alert('O horário de entrega não pode ser retroativo!');
            return;
        }
    }

    // Gerar HTML das etiquetas
    const container = document.getElementById('etiquetasContainer');
    container.innerHTML = '';
    etiquetasGeradas = [];

    for (let i = 0; i < dados.quantidade; i++) {
        const codigo = gerarCodigoRastreamento();
        const etiquetaHTML = `
            <div class="etiqueta">
                <div class="codigo-rastreamento">${codigo}</div>
                <div class="header">
                    <div class="urgente">🚨 ENTREGA URGENTE</div>
                    <div class="empresa">MD TRANSPORTES</div>
                    <div class="titulo">Carga Agendada</div>
                </div>
                
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">📅 Data:</span>
                        <span class="info-value">${dados.data}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🕐 Horário:</span>
                        <span class="info-value">${dados.horario}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">👤 Destinatário:</span>
                        <span class="info-value">${dados.destinatario}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📞 Telefone:</span>
                        <span class="info-value">${dados.telefone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📍 Endereço:</span>
                        <span class="info-value">${dados.endereco}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📦 Produto:</span>
                        <span class="info-value">${dados.produto}</span>
                    </div>
                </div>
                
                <div class="observacoes">
                    <div class="observacoes-title">⚠️ Observações:</div>
                    <div class="observacoes-content">${dados.observacoes || 'Nenhuma observação especial'}</div>
                </div>
                
                <div class="contato-section">
                    <div class="contato-title">📞 Suporte ao Motorista</div>
                    <div class="contato-info">
                        <strong>${dados.responsavel}</strong>
                    </div>
                </div>
                
                <div class="qr-placeholder">QR</div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', etiquetaHTML);
        etiquetasGeradas.push({...dados, codigo});
    }

    // Mostrar mensagem de sucesso
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = `✅ ${dados.quantidade} etiqueta(s) gerada(s) com sucesso!`;
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);

    // Scroll para as etiquetas
    document.getElementById('etiquetasContainer').scrollIntoView({ behavior: 'smooth' });
}

// Função para imprimir etiquetas
function imprimirEtiquetas() {
    if (etiquetasGeradas.length === 0) {
        alert('Primeiro gere as etiquetas antes de imprimir!');
        return;
    }
    
    window.print();
}

// Função para gerar PDF
async function gerarPDF() {
    if (etiquetasGeradas.length === 0) {
        alert('Primeiro gere as etiquetas antes de baixar o PDF!');
        return;
    }

    try {
        const etiquetas = document.querySelectorAll('.etiqueta');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const margin = 5; // Margem para cada etiqueta na página, em mm
        const etiquetaWidth = 90; // Largura da etiqueta em mm (aproximada, consistente com o CSS)
        const etiquetaHeight = 135; // Altura da etiqueta em mm (aproximada)
        const a4Width = 210;
        const a4Height = 297;

        let xOffset = margin;
        let yOffset = margin;

        for (let i = 0; i < etiquetas.length; i++) {
            const etiqueta = etiquetas[i];

            // Garante que a etiqueta é visível para o html2canvas
            etiqueta.style.visibility = 'visible';
            etiqueta.style.position = 'relative'; 

            const canvas = await html2canvas(etiqueta, {
                scale: 5, // Aumenta a resolução para melhor qualidade no PDF
                imageSmoothingEnabled: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = etiquetaWidth; // Usar a largura da etiqueta para o PDF
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Manter proporção

            // Verifica se a etiqueta cabe na linha atual
            if ((xOffset + imgWidth + margin) > a4Width) {
                xOffset = margin; // Volta para o início da linha
                yOffset += etiquetaHeight + margin; // Desce para a próxima linha
            }

            // Verifica se a etiqueta cabe na página atual
            if ((yOffset + imgHeight + margin) > a4Height) {
                pdf.addPage();
                xOffset = margin;
                yOffset = margin;
            }

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

            // Atualiza o offset para a próxima etiqueta
            xOffset += imgWidth + margin;
        }

        // Salvar PDF
        const nomeArquivo = `etiquetas_agiily_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(nomeArquivo);
        
        // Mostrar mensagem de sucesso
        const successMsg = document.getElementById('successMessage');
        successMsg.textContent = `📄 PDF gerado com sucesso: ${nomeArquivo}`;
        successMsg.style.display = 'block';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente ou use a função de impressão.');
    }
}

// Função para limpar formulário
function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        document.getElementById('etiquetaForm').reset();
        document.getElementById('etiquetasContainer').innerHTML = '';
        etiquetasGeradas = [];
        contadorCodigo = 1;
        
        // Reconfigurar data e hora atuais
        document.getElementById('dataEntrega').value = new Date().toISOString().split('T')[0];
        document.getElementById('horarioEntrega').value = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    }
}

// Mascarar campo de telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 11) {
        value = value.slice(0, 11);
    }
    
    if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 0) {
        value = value.replace(/^(\d{1,2})/, '($1');
    }
    
    e.target.value = value;
});

// Event listener para o formulário
document.getElementById('etiquetaForm').addEventListener('submit', gerarEtiquetas);

// Atalhos do teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        imprimirEtiquetas();
    }
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        gerarPDF();
    }
});
