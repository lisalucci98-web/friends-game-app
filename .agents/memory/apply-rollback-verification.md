---
name: Apply rollback verification
description: I test di apply devono simulare un errore dopo scritture aggregate ed entry e controllare separatamente l’autosomma del totale.
---

Un test di rollback compensativo è significativo solo se il PATCH fallisce dopo almeno una modifica riuscita a un aggregate e a una entry; il controllo dei totali non autosommanti deve restare una verifica post-apply distinta.

**Why:** Un fallimento prima della prima scrittura non dimostra che i valori parziali vengano ripristinati, mentre confondere l’autosomma con la conformità al report può nascondere un totale incoerente.

**How to apply:** Nei test dell’apply usa un client Supabase simulato con stato in memoria, forza il fallimento dopo modifiche di prediction ed entry, confronta lo stato finale con lo snapshot iniziale e asserisci esplicitamente la lista dei totali non autosommanti.