"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseTest } from "@/components/database-test"
import {
  CheckCircle,
  Calendar,
  BarChart3,
  Users,
  Smartphone,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TAL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Task and Life Manager</h1>
                <p className="text-sm text-gray-600">Kelola tugas dan hidup Anda dengan mudah</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Kelola Hidup Anda dengan{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lebih Efektif
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              TAL adalah platform manajemen tugas dan kehidupan yang membantu Anda mengorganisir aktivitas harian,
              mencapai tujuan, dan meningkatkan produktivitas dengan fitur-fitur canggih dan antarmuka yang intuitif.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Mulai Gratis Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sudah Punya Akun? Masuk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dilengkapi dengan berbagai fitur canggih untuk membantu Anda mengelola tugas dan kehidupan dengan lebih
              efisien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Manajemen Tugas</CardTitle>
                <CardDescription>
                  Buat, kelola, dan lacak tugas dengan sistem prioritas, kategori, dan deadline yang fleksibel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Kalender Terintegrasi</CardTitle>
                <CardDescription>
                  Visualisasi tugas dan jadwal dalam tampilan kalender yang mudah dipahami dan digunakan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Analytics & Laporan</CardTitle>
                <CardDescription>
                  Analisis produktivitas dengan grafik dan laporan detail untuk memahami pola kerja Anda
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Mobile Responsive</CardTitle>
                <CardDescription>
                  Akses dari mana saja dengan antarmuka yang dioptimalkan untuk desktop, tablet, dan smartphone
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Keamanan Tinggi</CardTitle>
                <CardDescription>
                  Data Anda aman dengan enkripsi end-to-end dan sistem autentikasi yang robust
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Panel admin lengkap untuk mengelola pengguna, sistem, dan monitoring aktivitas aplikasi
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-16">
            <h3 className="text-3xl font-bold mb-4">Mengapa Memilih TAL?</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Platform yang telah terbukti membantu ribuan pengguna meningkatkan produktivitas dan mencapai tujuan
              mereka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Tugas Diselesaikan</div>
            </div>

            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">1K+</div>
              <div className="text-blue-100">Pengguna Aktif</div>
            </div>

            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Tingkat Kepuasan</div>
            </div>

            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Dukungan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Test Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Test Sistem Database</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Verifikasi bahwa sistem database telah dikonfigurasi dengan benar dan siap digunakan
            </p>
          </div>
          <DatabaseTest />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Siap Meningkatkan Produktivitas Anda?</h3>
            <p className="text-xl text-gray-600 mb-8">
              Bergabunglah dengan ribuan pengguna yang telah merasakan manfaat TAL dalam mengelola tugas dan kehidupan
              mereka
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Mulai Sekarang - Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Masuk ke Akun Anda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">TAL</span>
                </div>
                <span className="font-bold text-lg">Task and Life Manager</span>
              </div>
              <p className="text-gray-400">
                Platform manajemen tugas dan kehidupan yang membantu Anda mencapai produktivitas maksimal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Manajemen Tugas</li>
                <li>Kalender</li>
                <li>Analytics</li>
                <li>Mobile App</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dokumentasi</li>
                <li>FAQ</li>
                <li>Kontak</li>
                <li>Status Sistem</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tentang Kami</li>
                <li>Blog</li>
                <li>Karir</li>
                <li>Kebijakan Privasi</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TAL - Task and Life Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
