"use client"

import { motion } from "framer-motion"
import { LayoutDashboard, Kanban, Users, BarChart3, Bell, Shield } from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Intuitive Dashboard",
    description: "Get a bird's eye view of your projects with real-time statistics and activity feeds.",
  },
  {
    icon: Kanban,
    title: "Visual Kanban Boards",
    description: "Drag-and-drop task management with smooth animations and instant updates.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign tasks, mention teammates, and keep everyone in sync effortlessly.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description: "Track progress, identify bottlenecks, and optimize your team's performance.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Stay updated with intelligent alerts for deadlines, assignments, and updates.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Role-based access control and audit logs to keep your data safe.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-balance"
          >
            Everything you need to manage work effectively
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Powerful features designed for modern teams
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-3d group relative p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
