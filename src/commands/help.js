const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show how to use the bot (แสดงคู่มือวิธีการใช้งานบอท)'),
    
  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🎮 คู่มือการใช้งาน Game Top-up Bot')
      .setDescription('สวัสดีครับ! นี่คือคู่มือการใช้งานบอทสำหรับบันทึกและประเมินการเติมเงินเกมของคุณ\n\nคำสั่งทั้งหมดที่มีให้ใช้งานมีดังนี้:')
      .addFields(
        { 
          name: '📝 `/topup <game>` (บันทึกรายจ่าย)', 
          value: 'ใช้สำหรับบันทึกยอดการเติมเงินใหม่\n- คุณสามารถพิมพ์ชื่อเกมใหม่ หรือเลือกจากที่บอทแนะนำได้\n- เมื่อกด Enter บอทจะแสดงฟอร์มขึ้นมาให้คุณกรอก รบกวนกรอกเลขตัวเงินให้ครบถ้วน' 
        },
        { 
          name: '📊 `/summary [game]` (ดูยอดรวมทั้งหมด)', 
          value: 'ใช้สำหรับตรวจสอบยอดว่าเราเติมเงินไปเท่าไหร่แล้ว\n- ไม่ระบุชื่อเกม: ตัวบอทจะส่งยอดรวมทั้งหมดของทุกเกมมาให้\n- ระบุชื่อเกม: ตัวบอทจะสรุปยอดให้เฉพาะเกมที่คุณกำลังเลือก' 
        },
        { 
          name: '❓ `/help` (ช่วยเหลือ)', 
          value: 'แสดงหน้าต่างนี้ เพื่อดูวิธีการใช้งาน' 
        }
      )
      .setFooter({ text: 'Discord Server Top-up Tracker', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
};
