import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnygxmtoloxcvsoimchr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueWd4bXRvbG94Y3Zzb2ltY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MjYwNDYsImV4cCI6MjA5ODAwMjA0Nn0.ROVWVJfWEqS7C_8QQra1RADeeSeS0XVO5Ny8dxd-3bs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const employees = [
  {
    role: "employee",
    full_name: "Ana Souza Pereira",
    cpf: "123.456.789-01",
    birth_date: "1988-04-15",
    email: "ana.pereira@bellevie.com.br",
    phone: "(11) 98765-4321",
    password: "SenhaSegura!123",
    specialization: "Esteticista Facial",
    address_cep: "01001-000",
    address_street: "Praça da Sé",
    address_number: "100",
    address_complement: "Sala 12",
    address_neighborhood: "Sé",
    address_city: "São Paulo",
    address_state: "SP"
  },
  {
    role: "employee",
    full_name: "Carlos Mendes",
    cpf: "987.654.321-09",
    birth_date: "1992-11-20",
    email: "carlos.mendes@bellevie.com.br",
    phone: "(11) 91234-5678",
    password: "SenhaSegura!456",
    specialization: "Biomédico Esteta",
    address_cep: "04571-010",
    address_street: "Avenida Engenheiro Luís Carlos Berrini",
    address_number: "1500",
    address_complement: "Andar 5",
    address_neighborhood: "Cidade Monções",
    address_city: "São Paulo",
    address_state: "SP"
  }
];

const clients = [
  {
    role: "client",
    full_name: "Mariana Costa",
    cpf: "456.123.789-10",
    birth_date: "1995-07-08",
    email: "mariana.costa@email.com",
    phone: "(11) 97777-8888",
    password: "Mariana@2026",
    address_cep: "01310-100",
    address_street: "Avenida Paulista",
    address_number: "2000",
    address_complement: "Apto 45",
    address_neighborhood: "Bela Vista",
    address_city: "São Paulo",
    address_state: "SP"
  },
  {
    role: "client",
    full_name: "Roberto Alves",
    cpf: "321.654.987-21",
    birth_date: "1980-02-25",
    email: "roberto.alves@email.com",
    phone: "(11) 95555-4444",
    password: "Roberto@2026",
    address_cep: "05424-020",
    address_street: "Rua dos Pinheiros",
    address_number: "500",
    address_complement: "Casa 2",
    address_neighborhood: "Pinheiros",
    address_city: "São Paulo",
    address_state: "SP"
  }
];

async function seed() {
  const allUsers = [...employees, ...clients];

  for (const user of allUsers) {
    console.log(`Registrando ${user.full_name}...`);
    
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (error) {
      console.error(`Erro ao criar Auth para ${user.full_name}:`, error.message);
      continue;
    }

    if (!data.user) {
      console.error(`Falha inesperada ao criar Auth para ${user.full_name}`);
      continue;
    }

    // 2. Update public profile
    const profileUpdate = {
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      cpf: user.cpf,
      birth_date: user.birth_date,
      address_cep: user.address_cep,
      address_street: user.address_street,
      address_number: user.address_number,
      address_complement: user.address_complement,
      address_neighborhood: user.address_neighborhood,
      address_city: user.address_city,
      address_state: user.address_state
    };

    if (user.role === 'employee') {
      profileUpdate.specialization = user.specialization;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', data.user.id);

    if (profileError) {
      console.error(`Erro ao atualizar perfil para ${user.full_name}:`, profileError.message);
    } else {
      console.log(`✅ Sucesso: ${user.full_name} criado.`);
    }
    
    // Logout to clear the session before the next user
    await supabase.auth.signOut();
  }
  
  console.log("Processo concluído!");
}

seed();
