"use client"

import { motion } from "framer-motion"

const steps = [
  {
    step: "01",
    title: "Create Your Workspace",
    description: "Set up your team workspace in seconds. Invite members and define roles.",
  },
  {
    step: "02",
    title: "Plan Your Projects",
    description: "Break down work into projects and tasks. Set priorities and deadlines.",
  },
  {
    step: "03",
    title: "Collaborate & Track",
    description: "Work together in real-time. Visualize progress on Kanban boards.",
  },
  {
    step: "04",
    title: "Analyze & Improve",
    description: "Get insights from analytics. Continuously improve your workflow.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold"
          >
            How FlowSync Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Get started in minutes, not days
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent -translate-x-8" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
