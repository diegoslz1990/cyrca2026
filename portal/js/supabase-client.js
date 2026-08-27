// Conexion a Supabase (proyecto "cyrca portal").
// Esta clave es la "publishable key" - esta hecha para usarse en el
// navegador, no es secreta. La seguridad real la maneja Supabase con
// las reglas de Row Level Security que configuramos en la tabla "jobs".
const SUPABASE_URL = 'https://ragakqwaevyukrnvogzn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VnC4QtorL1zLSapfGzyk5Q_ANGpDPPw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
