// SOLUÇÃO SIMPLES E DIRETA - Sobrescreve tudo
(function () {
    console.log('=== NOVA LÓGICA DE SUBMISSÃO CARREGADA ===');

    window.addEventListener('DOMContentLoaded', function () {
        // Capturar TODOS os formulários
        var forms = document.querySelectorAll('form');

        forms.forEach(function (form) {
            // Remover TODOS os event listeners antigos
            var newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Adicionar APENAS o nosso handler
            newForm.addEventListener('submit', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                console.log('📝 Formulário enviado!');

                // Pegar valores
                var nameInput = newForm.querySelector('[name="name"]');
                var phoneInput = newForm.querySelector('[name="phone"]');

                var name = nameInput ? nameInput.value.trim() : '';
                var phone = phoneInput ? phoneInput.value.trim() : '';

                // Validação SIMPLES
                if (!name || name.length < 2) {
                    alert('Por favor, digite seu nome completo');
                    return;
                }

                if (!phone || phone.length < 8) {
                    alert('Por favor, digite um telefone válido');
                    return;
                }

                console.log('✅ Validação OK!');

                // Desabilitar botão
                var btn = newForm.querySelector('button[type="submit"]');
                if (btn) btn.disabled = true;

                // Coletar TODOS os dados do form
                var formData = {};
                var inputs = newForm.querySelectorAll('input, select, textarea');
                inputs.forEach(function (input) {
                    if (input.name) {
                        formData[input.name] = input.value;
                    }
                });

                // Adicionar dados da URL
                var urlParams = new URLSearchParams(window.location.search);
                ['gclid', 'web_id', 'sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(function (param) {
                    var val = urlParams.get(param);
                    if (val) formData[param] = val;
                });

                // Mapear gclid para sub1
                if (formData.gclid && !formData.sub1) {
                    formData.sub1 = formData.gclid;
                }

                console.log('📤 Enviando para API:', formData);

                // Enviar para API
                fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                    .then(function (response) {
                        if (!response.ok) {
                            return response.text().then(function (text) {
                                throw new Error('HTTP ' + response.status + ': ' + text);
                            });
                        }
                        return response.json();
                    })
                    .then(function (data) {
                        console.log('✅ Resposta da API:', data);
                        if (data.success) {
                            window.location.href = '/?status=success';
                        } else {
                            alert('Erro: ' + (data.error || 'Erro desconhecido'));
                            if (btn) btn.disabled = false;
                        }
                    })
                    .catch(function (error) {
                        console.error('❌ Erro:', error);
                        alert('Erro ao enviar: ' + error.message);
                        if (btn) btn.disabled = false;
                    });
            }, true);
        });

        console.log('✅ Handler instalado em ' + forms.length + ' formulário(s)');
    });
})();
